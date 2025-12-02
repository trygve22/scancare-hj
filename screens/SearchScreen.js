import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { openProductDetail } from '../utils/navigationRef';
import { Ionicons } from '@expo/vector-icons';
import { makeStyles } from '../styles/SearchScreen.styles';
import { useTheme } from '../styles/ThemeContext';
import Typography from '../components/Typography';
import { moisturizerSections } from '../data/moisturizers';
import { brandLogos } from '../data/brandLogos';

export default function SearchScreen() {
	const navigation = useNavigation();
	const route = useRoute();
	const { theme } = useTheme();
	const styles = useMemo(() => makeStyles(theme), [theme]);
	const [query, setQuery] = useState('');

	// Flatten sections into product objects (support structured objects)
	const flatProducts = useMemo(() => {
		return moisturizerSections.flatMap(section => 
			section.data.map(raw => {
				if (typeof raw === 'string') {
					return {
						name: raw,
						category: section.title,
						id: `${section.title}-${raw}`
					};
				}
				// structured product object
				return {
					...raw,
					category: section.title,
					id: `${section.title}-${raw.name}`
				};
			})
		);
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return flatProducts;
		return flatProducts.filter(product => 
			product.name.toLowerCase().includes(q) || 
			product.category.toLowerCase().includes(q)
		);
	}, [query, flatProducts]);

	// Hvis vi er åbnet med et scannet produkt, så naviger
	// videre til ProductDetail og ryd parametren, så det
	// ikke trigges igen ved tilbage-navigation.
	useEffect(() => {
		const scannedProduct = route.params?.scannedProduct;
		if (!scannedProduct) return;

		// Navigér til ProductDetail med produktet
		navigation.navigate('ProductDetail', { product: scannedProduct });

		// Ryd param, så effect kun kører én gang
		navigation.setParams && navigation.setParams({ scannedProduct: undefined });
	}, [route.params, navigation]);

	const selectProduct = (product) => {
		// Gå direkte til produktdetaljer ved tryk
		openProductDetail(navigation, product);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Typography variant="h2" style={styles.headerTitle}>Søg Produkter</Typography>
			</View>
			<TextInput
				placeholder="Søg..."
				value={query}
				onChangeText={setQuery}
				style={styles.searchInput}
				autoCapitalize="none"
				autoCorrect={false}
				clearButtonMode="while-editing"
			/>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => {
					// Prefer explicit brand field on the product, fallback to category
					const rawBrand = item.brand || item.category || '';
					const brand = rawBrand.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').trim();
					const logo = brandLogos[brand];

					return (
						<TouchableOpacity 
							onPress={() => selectProduct(item)} 
							style={styles.item}
							activeOpacity={0.7}
						>
							<View style={styles.productItem}>
								{logo ? (
									<Image source={logo} style={styles.brandLogo} resizeMode="contain" />
								) : null}

								<View style={styles.productInfo}>
									<Typography style={styles.itemText}>{item.name}</Typography>
									<Typography variant="small" muted style={styles.categoryText}>{brand}</Typography>
								</View>

								<View style={styles.productActions}>
									<Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted || '#999'} />
								</View>
							</View>
						</TouchableOpacity>
					);
				}}
				ListEmptyComponent={<Typography muted style={styles.emptyText}>Ingen resultater</Typography>}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	);
}
