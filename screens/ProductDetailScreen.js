import React, { useMemo, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { makeStyles } from '../styles/ProductDetailScreen.styles';
import { useTheme } from '../styles/ThemeContext';
import Typography from '../components/Typography';
import { addFavorite, removeFavorite, isFavorite } from '../utils/favorites';
import { productImages } from '../data/productImages';

// Mock review data for demonstration
const getMockReviews = (productName) => {
	return {
		averageRating: (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating between 3.5-5.0
		totalReviews: Math.floor(Math.random() * 500) + 50, // Random count 50-550
		ratingDistribution: {
			5: Math.floor(Math.random() * 40) + 40,
			4: Math.floor(Math.random() * 30) + 20,
			3: Math.floor(Math.random() * 15) + 5,
			2: Math.floor(Math.random() * 10) + 2,
			1: Math.floor(Math.random() * 5) + 1,
		},
		commonPros: [
			'Meget hydrerende',
			'Lækker tekstur',
			'God værdi for pengene',
			'Ingen duft',
		],
		commonCons: [
			'Kan være for tyk',
			'Tager tid at absorbere',
			'Emballage kunne være bedre',
		],
		topReviews: [
			{ user: 'Sarah K.', rating: 5, text: 'Fantastisk produkt! Min hud føles så blød og hydreret.' },
			{ user: 'Maria L.', rating: 4, text: 'Rigtig godt produkt, men kunne ønske det absorberede hurtigere.' },
			{ user: 'Jonas P.', rating: 5, text: 'Bedste fugtighedscreme jeg har prøvet. Anbefales!' },
		]
	};
};

export default function ProductDetailScreen({ route }) {
	const navigation = useNavigation();
	const { theme } = useTheme();
	const styles = useMemo(() => makeStyles(theme), [theme]);
	const { product } = route.params || {};

	const [fav, setFav] = useState(false);
	const [reviews, setReviews] = useState(null);
	const [imageUri, setImageUri] = useState(null);
	const [imageLoading, setImageLoading] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [imageQueries, setImageQueries] = useState([]);
	const [imageAttemptIndex, setImageAttemptIndex] = useState(0);
	const [useLocalPlaceholder, setUseLocalPlaceholder] = useState(false);

	useEffect(() => {
		let mounted = true;
		(async () => {
			if (!product) return;
			const res = await isFavorite(product.id || `p-${product.name}`);
			if (mounted) setFav(res);
			// Load mock reviews
			const mockReviews = getMockReviews(product.name);
			if (mounted) setReviews(mockReviews);

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

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
			{/* Header with back button */}
			<View style={styles.header}>
				<TouchableOpacity 
					style={styles.backButton} 
					onPress={() => {
						console.log('Back button pressed');
						navigation.navigate('SearchMain');
					}}
				>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Typography variant="h3" style={styles.headerTitle}>Produkt Detaljer</Typography>
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
						<Image source={productImages[product.name]} style={styles.productImage} resizeMode="cover" />
					) : imageUri && !imageError ? (
						<View style={{ alignItems: 'center', justifyContent: 'center' }}>
							<Image
								source={{ uri: imageUri }}
								style={styles.productImage}
								resizeMode="cover"
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
										setImageUri(`https://source.unsplash.com/160x160/?${next}`);
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
						<Image source={require('../assets/icon.png')} style={styles.productImage} resizeMode="cover" />
					) : (
						<View style={styles.productIcon}>
							<Typography variant="h1" style={styles.iconText}>{categoryEmoji}</Typography>
						</View>
					)}
					<Typography variant="h2" style={styles.productName}>{product.name}</Typography>
					<Typography variant="body" muted style={styles.categoryText}>{product.category}</Typography>
				</View>

				{/* Product Info Cards */}
				<View style={styles.infoSection}>
					<View style={styles.infoCard}>
						<View style={styles.infoHeader}>
							<Ionicons name="information-circle" size={20} color={theme.colors.primary} />
							<Typography variant="h3" style={styles.infoTitle}>Om Produktet</Typography>
						</View>
						<Typography variant="body" style={styles.infoText}>
							Dette er en populær fugtighedscreme fra kategorien {product.category.replace(/^[\u{1F300}-\u{1F9FF}]/u, '').trim()}.
						</Typography>
					</View>

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

					{/* Reviews Section */}
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

							{/* Common Pros and Cons */}
							<View style={styles.prosConsSection}>
								<View style={{ flex: 1, marginRight: 8 }}>
									<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
										<Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
										<Typography variant="body" weight="600" style={{ marginLeft: 6, color: theme.colors.text }}>
											Fordele
										</Typography>
									</View>
									{reviews.commonPros.map((pro, idx) => (
										<Typography key={idx} variant="small" style={{ color: theme.colors.text, marginBottom: 4 }}>
											• {pro}
										</Typography>
									))}
								</View>

								<View style={{ flex: 1, marginLeft: 8 }}>
									<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
										<Ionicons name="alert-circle" size={18} color="#FF9800" />
										<Typography variant="body" weight="600" style={{ marginLeft: 6, color: theme.colors.text }}>
											Ulemper
										</Typography>
									</View>
									{reviews.commonCons.map((con, idx) => (
										<Typography key={idx} variant="small" style={{ color: theme.colors.text, marginBottom: 4 }}>
											• {con}
										</Typography>
									))}
								</View>
							</View>

							{/* Top Reviews */}
							<View style={{ marginTop: 16 }}>
								<Typography variant="body" weight="600" style={{ marginBottom: 12, color: theme.colors.text }}>
									Top anmeldelser
								</Typography>
								{reviews.topReviews.map((review, idx) => (
									<View key={idx} style={[styles.reviewItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
										<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
											<Typography variant="body" weight="600" style={{ color: theme.colors.text }}>
												{review.user}
											</Typography>
											<View style={{ flexDirection: 'row' }}>
												{[...Array(review.rating)].map((_, i) => (
													<Ionicons key={i} name="star" size={14} color="#FFB800" />
												))}
											</View>
										</View>
										<Typography variant="small" style={{ color: theme.colors.text }}>
											{review.text}
										</Typography>
									</View>
								))}
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

