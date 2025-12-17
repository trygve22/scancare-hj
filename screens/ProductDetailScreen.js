import React, { useMemo, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { makeStyles } from '../styles/ProductDetailScreen.styles';
import { useTheme } from '../styles/ThemeContext';
import Typography from '../components/Typography';
import { addFavorite, removeFavorite, isFavorite } from '../utils/favorites';
import { productImages } from '../data/productImages';
import { fetchReviewsForProduct, submitReviewForProduct, deleteReview } from '../utils/reviews';
import { getMockReviewsForProduct } from '../data/mockReviews';
import { brandLogos } from '../data/brandLogos';
import { hasScannedProduct } from '../utils/history';
import { navigationRef } from '../utils/navigationRef';
import { getApiKey, callOpenAI } from '../utils/openai';

// Helper to derive aggregate stats from an array of review objects
const buildAggregateFromReviews = (items) => {
	if (!items || !items.length) {
		return {
			averageRating: '0.0',
			totalReviews: 0,
			ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
		};
	}
	const sum = items.reduce((acc, r) => acc + (r.rating || 0), 0);
	const avg = (sum / items.length).toFixed(1);
	const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
	items.forEach(r => {
		const key = Math.round(r.rating || 0);
		if (dist[key] != null) dist[key] += 1;
	});
	const distPct = {};
	Object.keys(dist).forEach(k => {
		distPct[k] = items.length ? Math.round((dist[k] / items.length) * 100) : 0;
	});
	return {
		averageRating: avg,
		totalReviews: items.length,
		ratingDistribution: distPct,
	};
};

export default function ProductDetailScreen({ route }) {
	const navigation = useNavigation();
	const { theme } = useTheme();
	const styles = useMemo(() => makeStyles(theme), [theme]);
	const { product } = route.params || {};

	const [fav, setFav] = useState(false);
	const [reviews, setReviews] = useState(null);
	const [userReviews, setUserReviews] = useState([]);
	const [newRating, setNewRating] = useState(0);
	const [newReviewText, setNewReviewText] = useState('');
	const [submittingReview, setSubmittingReview] = useState(false);
	const [imageUri, setImageUri] = useState(null);
	const [imageLoading, setImageLoading] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [imageAspect, setImageAspect] = useState(1);
	const [imageQueries, setImageQueries] = useState([]);
	const [imageAttemptIndex, setImageAttemptIndex] = useState(0);
	const [useLocalPlaceholder, setUseLocalPlaceholder] = useState(false);
	const [prefs, setPrefs] = useState(null);
	const [productSummary, setProductSummary] = useState(null);
	const [productSummaryLoading, setProductSummaryLoading] = useState(false);
	const [canReview, setCanReview] = useState(false);
	const [currentUserId, setCurrentUserId] = useState(null);

	// Helper to compute layout style for image given its aspect ratio
	const getImageLayoutStyle = (aspect = 1) => {
		const screenW = Dimensions.get('window').width;
		const horizontalPadding = 48; // matches content padding
		// Cap the displayed image size so it's not too large on big screens
		const MAX_WIDTH = Math.min(320, screenW - horizontalPadding);
		const MAX_HEIGHT = 240; // ensure tall images don't grow excessively
		let width = Math.round(Math.min(MAX_WIDTH, screenW - horizontalPadding));
		let height = Math.round(width / (aspect || 1));
		if (height > MAX_HEIGHT) {
			height = MAX_HEIGHT;
			width = Math.round(height * (aspect || 1));
		}
		return { width, height };
	};

	useEffect(() => {
		let mounted = true;
		(async () => {
			if (!product) return;
			const productId = product.id || `p-${product.name}`;
			const res = await isFavorite(productId);
			if (mounted) setFav(res);

			// Load reviews from Firebase
			try {
				const items = await fetchReviewsForProduct(productId);
				if (!mounted) return;
				setUserReviews(items);
				// Derive simple aggregate stats fra Firestore, eller fald tilbage til mock-reviews
				if (items.length) {
					setReviews(buildAggregateFromReviews(items));
				} else {
					const mockItems = getMockReviewsForProduct(product.name);
					setUserReviews(mockItems);
					setReviews(buildAggregateFromReviews(mockItems));
				}
			} catch (e) {
				console.warn('Failed to load reviews from Firebase', e);
			}

			// If we have a bundled local image for this product, prefer that (offline-safe)
			if (productImages && productImages[product.name]) {
				if (mounted) {
					setUseLocalPlaceholder(false);
					setImageUri(null);
					setImageLoading(false);
				}
				// local image will be rendered directly in JSX via productImages mapping
				return;
			}

			// Set a product image URI using Unsplash Source as a lightweight demo.
			// This returns a relevant image for the query without API keys.
			// Build a list of progressively-fallback queries to try for Unsplash
			const fullName = (product.name || '').trim();
			const category = (product.category || '').replace(/^[\u{1F300}-\u{1F9FF}]/u, '').trim();
			const brand = fullName.split(' ')[0] || '';
			const queries = [];
			if (fullName) queries.push(fullName);
			if (brand && brand.toLowerCase() !== fullName.toLowerCase()) queries.push(brand);
			if (category && category.toLowerCase() !== fullName.toLowerCase()) queries.push(category);
			queries.push('skincare');
			// Deduplicate and encode
			const unique = Array.from(new Set(queries.map(q => q.trim()).filter(Boolean)));
			if (mounted) {
				setImageQueries(unique);
				setImageAttemptIndex(0);
				setImageError(false);
				setImageLoading(true);
				// Set first URI
				const first = encodeURIComponent(unique[0] || 'skincare');
				setImageUri(`https://source.unsplash.com/160x160/?${first}`);
			}
		})();
		return () => { mounted = false; };
	}, [product]);

	// Compute and set aspect ratio for the currently displayed image (local or remote)
	useEffect(() => {
		let mounted = true;
		const srcLocal = productImages && productImages[product.name];
		if (srcLocal) {
			try {
				const resolved = Image.resolveAssetSource(srcLocal);
				if (mounted && resolved && resolved.width && resolved.height) {
					setImageAspect(resolved.width / resolved.height);
				}
			} catch (e) { /* ignore */ }
		} else if (imageUri) {
			// Remote image: fetch intrinsic size
			Image.getSize(imageUri, (w, h) => {
				if (mounted && w && h) setImageAspect(w / h);
			}, (err) => {
				// ignore failure to get size — keep default aspect
				console.warn('Failed to get image size for', imageUri, err);
			});
		}
		return () => { mounted = false; };
	}, [imageUri, product]);

	// Ask AI for a short one-liner summary of the product, tailored to the user's skin type and allergies if available
	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!product) return;
			try {
				setProductSummaryLoading(true);
				const apiKey = await getApiKey();
				if (!apiKey) {
					setProductSummaryLoading(false);
					return;
				}

				const skin = prefs?.skin || null;
				const allergies = prefs?.allergies || [];

				let userContext = 'Brugeren har ikke angivet hudtype eller allergier.';
				if (skin && allergies.length) {
					userContext = `Brugeren har hudtypen "${skin}" og vil undgå disse ingredienser/allergener: ${allergies.join(', ')}.`;
				} else if (skin) {
					userContext = `Brugeren har hudtypen "${skin}" og har ikke angivet specifikke allergier.`;
				} else if (allergies.length) {
					userContext = `Brugeren har ikke angivet hudtype, men vil undgå disse ingredienser/allergener: ${allergies.join(', ')}.`;
				}

				const prompt = `Du er en dansk hudplejeekspert. ${userContext} Giv en kort, venlig one-liner (maks 25 ord), der beskriver dette hudplejeprodukt målrettet denne bruger. Fokuser på om produktet sandsynligvis passer til brugerens hudtype og om det ser ud til at undgå deres allergier, hvis muligt. Produktnavn: "${product.name}". Brand: "${product.brand || ''}". Beskrivelse: "${product.shortDescription || ''}"`;
				const reply = await callOpenAI(prompt, apiKey);
				if (!cancelled) setProductSummary(reply);
			} catch (e) {
				console.warn('Failed to fetch AI product summary', e);
			} finally {
				if (!cancelled) setProductSummaryLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [product, prefs]);

	// Load user preferences from AsyncStorage for comparison
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const skin = await AsyncStorage.getItem('SC_PROFILE_SKIN');
				const allergiesRaw = await AsyncStorage.getItem('SC_PROFILE_ALLERGIES');
				const brand = await AsyncStorage.getItem('SC_PROFILE_BRAND');
				if (!mounted) return;
				setPrefs({
					skin: skin || null,
					allergies: allergiesRaw ? JSON.parse(allergiesRaw) : [],
					brand: brand || null,
				});
			} catch (e) {
				console.warn('Failed to load user prefs in ProductDetailScreen', e);
			}
		})();
		return () => { mounted = false; };
	}, []);

	// Load current user id so we know which reviews are ours
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const stored = await AsyncStorage.getItem('SCANCARE_CURRENT_USER');
				if (!mounted) return;
				if (stored) {
					const parsed = JSON.parse(stored);
					setCurrentUserId(parsed?.id || null);
				}
			} catch (e) {
				console.warn('Failed to load current user for reviews', e);
			}
		})();
		return () => { mounted = false; };
	}, []);

	// Check if user has scanned this product before enabling review form
	useEffect(() => {
		let mounted = true;
		(async () => {
			if (!product || !product.name) return;
			try {
				const scanned = await hasScannedProduct(product.name);
				if (mounted) setCanReview(scanned);
			} catch (e) {
				console.warn('Failed to check scan history for product', e);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [product]);

	const compatibility = useMemo(() => {
		if (!prefs || !product) return null;
		const { skin, allergies, brand: favBrand } = prefs;

		const productSkinTypes = product.skinTypes || [];
		const productContains = product.contains || [];
		const productBrand = product.brand;

		const matchesSkin = skin && productSkinTypes.length
			? productSkinTypes.includes(skin)
			: null;

		const triggersAllergy = allergies && allergies.length
			? allergies.some(a => productContains.includes(a))
			: false;

		const avoidsAllergy = allergies && allergies.length
			? !triggersAllergy
			: null;

		const isFavoriteBrand = favBrand && productBrand
			? favBrand === productBrand
			: null;

		return { matchesSkin, avoidsAllergy, triggersAllergy, isFavoriteBrand };
	}, [prefs, product]);

	// Removed verbose debug logs - preserve only actionable warnings
	try {
		// keep a light check for unexpected navigation issues
		if (!navigation) console.warn('ProductDetailScreen - navigation object missing');
	} catch (e) { /* ignore */ }

	if (!product) {
		return (
			<View style={styles.container}>
				<Typography variant="h2" align="center">Produkt ikke fundet</Typography>
			</View>
		);
	}

	// Extract category emoji
	const categoryEmoji = product.category.match(/^[\u{1F300}-\u{1F9FF}]/u)?.[0] || '🧴';

	const cleanBrand = (product.brand || product.category || '').replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').trim();
	const brandLogo = brandLogos[cleanBrand];

	const productId = product.id || `p-${product.name}`;

	const handleSubmitReview = async () => {
		if (!canReview) {
			Alert.alert('Scan påkrævet', 'Du skal først scanne produktets stregkode, før du kan skrive en anmeldelse.');
			return;
		}
		if (submittingReview) return;
		try {
			setSubmittingReview(true);
			const res = await submitReviewForProduct({
				productId,
				productName: product.name,
				rating: newRating,
				text: newReviewText,
			});
			if (!res.success) {
				Alert.alert('Fejl', res.message || 'Kunne ikke gemme anmeldelse');
				return;
			}
			Alert.alert('Tak', 'Din anmeldelse er gemt');
			setNewRating(0);
			setNewReviewText('');
			// reload
			const items = await fetchReviewsForProduct(productId);
			setUserReviews(items);
		} catch (e) {
			Alert.alert('Fejl', e.message || 'Noget gik galt');
		} finally {
			setSubmittingReview(false);
		}
	};

	const handleDeleteReview = async (review) => {
		try {
			Alert.alert(
				'Slet anmeldelse',
				'Er du sikker på, at du vil slette din anmeldelse?',
				[
					{ text: 'Annuller', style: 'cancel' },
					{
						text: 'Slet',
						style: 'destructive',
						onPress: async () => {
							try {
								const res = await deleteReview(review.id, review.userId);
								if (!res.success) {
									Alert.alert('Fejl', res.message || 'Kunne ikke slette anmeldelse');
									return;
								}
								// Fjern lokalt fra listen uden at reloade alt
								setUserReviews(prev => prev.filter(r => r.id !== review.id));
							} catch (e) {
								Alert.alert('Fejl', e.message || 'Noget gik galt ved sletning');
							}
						},
					},
				]
			);
		} catch (e) {
			Alert.alert('Fejl', e.message || 'Noget gik galt ved sletning');
		}
	};

	const fromTab = route?.params?.fromTab;

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
			{/* Header with back button */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => {
						// Hvis vi kom fra For you-tabben, så gå bare ét skridt tilbage i hovedstacken
						if (fromTab === 'For you') {
							try {
								if (navigation && typeof navigation.goBack === 'function') {
									navigation.goBack();
									return;
								}
							} catch (e) {
								// fald igennem til eksisterende logik
							}
							// Fallback: skift eksplicit til For you-tabben
							if (navigationRef.isReady()) {
								navigationRef.navigate('MainTabs', { screen: 'For you' });
								return;
							}
						}

						// Hvis vi har en historik at gå tilbage i i SearchStack,
						// så brug goBack (korrekt iOS-swipe fra venstre).
						// Ellers: gå eksplicit til Søg -> SearchMain via global ref.
						try {
							const state = navigation.getState?.();
							const routes = state?.routes || [];
							const currentRoute = routes[state?.index ?? routes.length - 1];
							// Hvis vi tidligere har været på SearchMain i denne stack, så goBack
							const hasSearchMainInStack = routes.some(r => r.name === 'SearchMain');
							if (hasSearchMainInStack && typeof navigation.goBack === 'function') {
								navigation.goBack();
								return;
							}
						} catch (e) {
							// ignore and fall through to global navigation
						}

						// Fallback: nulstil til Søg -> SearchMain
						if (navigationRef.isReady()) {
							navigationRef.navigate('MainTabs', {
								screen: 'Søg',
								params: { screen: 'SearchMain' },
							});
						} else if (navigation && typeof navigation.navigate === 'function') {
							navigation.navigate('Søg', { screen: 'SearchMain' });
						}
					}}
				>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Typography variant="h2" style={styles.headerTitle}>Produkt Detaljer</Typography>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView
				style={styles.content}
				contentContainerStyle={{ paddingBottom: 24 }}
				showsVerticalScrollIndicator={false}
				bounces={false}
				overScrollMode="never"
				nestedScrollEnabled={true}
				keyboardDismissMode="on-drag"
			>
				{/* Product Hero Section */}
				<View style={styles.heroSection}>
					{productImages && productImages[product.name] ? (
						<View style={styles.productImageWrapper}>
							<Image source={productImages[product.name]} style={[styles.productImage, getImageLayoutStyle(imageAspect)]} resizeMode="contain" />
						</View>
					) : brandLogo ? (
						<View style={styles.productImageWrapper}>
							<Image source={brandLogo} style={[styles.productImage, getImageLayoutStyle(imageAspect)]} resizeMode="contain" />
						</View>
					) : imageUri && !imageError ? (
						<View style={styles.productImageWrapper}>
							<Image
								source={{ uri: imageUri }}
								style={[styles.productImage, getImageLayoutStyle(imageAspect)]}
								resizeMode="contain"
								onLoadStart={() => setImageLoading(true)}
								onLoadEnd={() => setImageLoading(false)}
								onError={(e) => {
									console.warn('Product image failed to load:', imageUri, e.nativeEvent?.error || e);
									// Try the next query in the list before giving up
									const nextIndex = imageAttemptIndex + 1;
									if (imageQueries && nextIndex < imageQueries.length) {
										const next = encodeURIComponent(imageQueries[nextIndex]);
										setImageAttemptIndex(nextIndex);
										setImageLoading(true);
										setImageUri(`https://source.unsplash.com/600x600/?${next}`);
										console.log('Retrying product image with query:', imageQueries[nextIndex]);
									} else {
										// All attempts failed — fall back to a local placeholder image (offline-safe)
										setImageUri(null);
										setUseLocalPlaceholder(true);
										setImageError(true);
										setImageLoading(false);
									}
								}}
							/>
							{imageLoading && (
								<ActivityIndicator style={{ position: 'absolute' }} size="small" color={theme.colors.primary} />
							)}
						</View>
					) : useLocalPlaceholder ? (
						// Use bundled local placeholder image when remote images fail or offline
						<View style={styles.productImageWrapper}>
							<Image source={require('../assets/icon.png')} style={[styles.productImage, getImageLayoutStyle(imageAspect)]} resizeMode="contain" />
						</View>
					) : (
						<View style={styles.productIcon}>
							<Typography variant="h1" style={styles.iconText}>{categoryEmoji}</Typography>
						</View>
					)}
					<Typography variant="h2" style={styles.productName}>{product.name}</Typography>
					{brandLogo ? (
						<Image source={brandLogo} style={styles.brandLogo} resizeMode="contain" />
					) : (
						<Typography variant="body" muted style={styles.categoryText}>{product.category}</Typography>
					)}
					{productSummary ? (
						<View style={styles.aiSummaryCard}>
							<Typography variant="small" style={{ textAlign: 'center' }}>
								{productSummary} - ChatGPT
							</Typography>
						</View>
					) : null}
				</View>

				{/* Product Info Cards */}
				<View style={styles.infoSection}>
					<View style={styles.infoCard}>
						<View style={styles.infoHeader}>
							<Ionicons name="information-circle" size={20} color={theme.colors.primary} />
							<Typography variant="h3" style={styles.infoTitle}>Om Produktet</Typography>
						</View>
						<Typography variant="body" style={styles.infoText}>
							{product.shortDescription || `Dette er et produkt fra kategorien ${product.category.replace(/^[\u{1F300}-\u{1F9FF}]/u, '').trim()}.`}
						</Typography>
					</View>

					{compatibility && (
						<View style={styles.infoCard}>
							<View style={styles.infoHeader}>
								<Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
								<Typography variant="h3" style={styles.infoTitle}>Match med dine præferencer</Typography>
							</View>

							{compatibility.matchesSkin !== null && (
								<Typography variant="body" style={styles.infoText}>
									Hudtype: {compatibility.matchesSkin ? 'Godt match til din hudtype' : 'Passer måske ikke optimalt til din hudtype'}
								</Typography>
							)}

							{compatibility.avoidsAllergy !== null && (
								<Typography variant="body" style={styles.infoText}>
									Allergier: {compatibility.avoidsAllergy
										? 'Indeholder ikke dine markerede allergier'
										: 'OBS: Kan indeholde noget, du er følsom overfor'}
								</Typography>
							)}

							{compatibility.isFavoriteBrand !== null && (
								<Typography variant="body" style={styles.infoText}>
									Brand: {compatibility.isFavoriteBrand
										? 'Dette er et af dine yndlingsbrands'
										: 'Ikke et af dine yndlingsbrands'}
								</Typography>
							)}
						</View>
					)}

					<View style={styles.infoCard}>
						<View style={styles.infoHeader}>
							<Ionicons name="star" size={20} color={theme.colors.primary} />
							<Typography variant="h3" style={styles.infoTitle}>Anbefalinger</Typography>
						</View>
						<Typography variant="body" style={styles.infoText}>
							Denne fugtighedscreme er velegnet til daglig brug og kan hjælpe med at holde huden hydreret.
						</Typography>
					</View>

					<View style={styles.infoCard}>
						<View style={styles.infoHeader}>
							<Ionicons name="leaf" size={20} color={theme.colors.primary} />
							<Typography variant="h3" style={styles.infoTitle}>Ingredienser</Typography>
						</View>
						<Typography variant="body" style={styles.infoText}>
							Indeholder typisk hyaluronsyre, ceramider og andre fugtgivende ingredienser.
						</Typography>
					</View>

					{/* Reviews Section (aggregated + user reviews + input) */}
					{reviews && (
						<View style={styles.reviewsCard}>
							<View style={styles.infoHeader}>
								<Ionicons name="star" size={20} color="#FFB800" />
								<Typography variant="h3" style={styles.infoTitle}>Anmeldelser</Typography>
							</View>
							
							{/* Average Rating */}
							<View style={styles.ratingOverview}>
								<View style={styles.ratingLeft}>
									<Typography variant="h1" style={{ color: theme.colors.text, fontSize: 48 }}>
										{reviews.averageRating}
									</Typography>
									<View style={styles.starsRow}>
										{[1, 2, 3, 4, 5].map((star) => (
											<Ionicons 
												key={star} 
												name={star <= Math.round(reviews.averageRating) ? 'star' : 'star-outline'} 
												size={16} 
												color="#FFB800" 
											/>
										))}
									</View>
									<Typography variant="small" muted style={{ marginTop: 4 }}>
										{reviews.totalReviews} anmeldelser
									</Typography>
								</View>

								{/* Rating Distribution */}
								<View style={styles.ratingRight}>
									{[5, 4, 3, 2, 1].map((rating) => (
										<View key={rating} style={styles.ratingBar}>
											<Typography variant="small" style={{ width: 20, color: theme.colors.text }}>
												{rating}★
											</Typography>
											<View style={[styles.barBackground, { backgroundColor: theme.colors.border }]}>
												<View 
													style={[
														styles.barFill, 
														{ 
															width: `${reviews.ratingDistribution[rating]}%`,
															backgroundColor: theme.colors.primary 
														}
													]} 
												/>
											</View>
											<Typography variant="small" muted style={{ width: 35, textAlign: 'right' }}>
												{reviews.ratingDistribution[rating]}%
											</Typography>
										</View>
									))}
								</View>
							</View>

							{/* Liste over brugeranmeldelser (Firebase eller mock) */}
							{userReviews.length > 0 && (
								<View style={{ marginTop: 16 }}>
									<Typography variant="body" weight="600" style={{ marginBottom: 12, color: theme.colors.text }}>
										Brugeranmeldelser
									</Typography>
									{userReviews.map((review, index) => (
										<View
											key={review.id || `${productId}-review-${index}`}
											style={[styles.reviewItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
										>
											<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
												<View>
													<Typography variant="body" weight="600" style={{ color: theme.colors.text }}>
														{review.userName || 'Bruger'}
													</Typography>
													<View style={{ flexDirection: 'row', marginTop: 2 }}>
														{[...Array(review.rating || 0)].map((_, i) => (
															<Ionicons key={i} name="star" size={14} color="#FFB800" />
														))}
													</View>
												</View>
												{currentUserId && review.userId === currentUserId && (
													<TouchableOpacity onPress={() => handleDeleteReview(review)}>
														<Ionicons name="trash" size={18} color={theme.colors.textMuted || '#999'} />
													</TouchableOpacity>
												)}
											</View>
											{review.text ? (
												<Typography variant="small" style={{ color: theme.colors.text }}>
													{review.text}
												</Typography>
											) : null}
										</View>
									))}
								</View>
							)}

							{/* Formular til ny anmeldelse */}
							<View style={{ marginTop: 16 }}>
								<Typography variant="body" weight="600" style={{ marginBottom: 4, color: theme.colors.text }}>
									Skriv din egen anmeldelse
								</Typography>
								{!canReview && (
									<Typography variant="small" muted style={{ marginBottom: 8 }}>
										Scan produktets stregkode først for at kunne skrive en anmeldelse.
									</Typography>
								)}
								<View style={{ flexDirection: 'row', marginBottom: 8, opacity: canReview ? 1 : 0.3 }}>
									{[1, 2, 3, 4, 5].map(star => (
										<TouchableOpacity
											key={star}
											onPress={() => canReview && setNewRating(star)}
											style={{ marginRight: 4 }}
											disabled={!canReview}
										>
											<Ionicons
												name={star <= newRating ? 'star' : 'star-outline'}
												size={24}
												color="#FFB800"
											/>
										</TouchableOpacity>
									))}
								</View>
								<TextInput
									placeholder="Del din oplevelse med produktet"
									value={newReviewText}
									onChangeText={setNewReviewText}
									style={{
										borderWidth: 1,
										borderColor: theme.colors.border,
										borderRadius: 8,
										padding: 10,
										color: theme.colors.text,
										minHeight: 60,
										textAlignVertical: 'top',
										opacity: canReview ? 1 : 0.4,
									}}
									multiline
									editable={canReview}
								/>
								<TouchableOpacity
									onPress={handleSubmitReview}
									style={{
										marginTop: 8,
										alignSelf: 'flex-start',
										backgroundColor: theme.colors.primary,
										paddingHorizontal: 16,
										paddingVertical: 8,
										borderRadius: 8,
										opacity: submittingReview || !canReview ? 0.4 : 1,
									}}
									disabled={submittingReview || !canReview}
								>
									<Typography variant="small" weight="600" style={{ color: '#fff' }}>
										{submittingReview ? 'Gemmer...' : 'Gem anmeldelse'}
									</Typography>
								</TouchableOpacity>
							</View>
						</View>
					)}
				</View>

							{/* Action Buttons */}
							<View style={styles.actionSection}>
								<TouchableOpacity style={styles.primaryButton} onPress={async () => {
									const favItem = { id: product.id || `p-${product.name}`, name: product.name, category: product.category };
									if (fav) {
										await removeFavorite(favItem.id);
										setFav(false);
										Alert.alert('Favoritter', 'Produkt fjernet fra favoritter');
									} else {
										await addFavorite(favItem);
										setFav(true);
										Alert.alert('Favoritter', 'Produkt tilføjet til favoritter', [
											{ text: 'Ok' },
											{ text: 'Åbn favoritter', onPress: () => {
												if (navigation && navigation.navigate) navigation.navigate('MainTabs', { screen: 'Favoritter' });
											}}
										]);
									}
								}}>
									<Typography variant="body" weight="600" style={styles.primaryButtonText}>
										{fav ? 'Fjern fra Favoritter' : 'Tilføj til Favoritter'}
									</Typography>
								</TouchableOpacity>
                    
								<TouchableOpacity style={styles.secondaryButton}>
									<Typography variant="body" weight="500" style={styles.secondaryButtonText}>
										Del Produkt
									</Typography>
								</TouchableOpacity>
							</View>
			</ScrollView>
			</View>
		</SafeAreaView>
	);
}

