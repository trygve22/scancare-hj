import React, { useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { openProductDetail } from '../utils/navigationRef';
import { Ionicons } from '@expo/vector-icons';
import { makeStyles } from '../styles/SearchScreen.styles';
import { useTheme } from '../styles/ThemeContext';
import Typography from '../components/Typography';
import { moisturizerSections } from '../data/moisturizers';
import { brandLogos } from '../data/brandLogos';

export default function SearchScreen() {
	const navigation = useNavigation();
	const { theme } = useTheme();
	const styles = useMemo(() => makeStyles(theme), [theme]);

	const [query, setQuery] = useState('');

	// Flatten sections into product objects (support both string and object data for safety)
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
				// new structured object format
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

	const selectProduct = (product) => {
		// Navigate directly to product detail when a product is pressed
		openProductDetail(navigation, product);
	};

	return (
		<View style={styles.container}>
			<Typography variant="h2" align="center">Søg Produkter</Typography>
			<Typography variant="body" muted align="center">Vælg en fugtighedscreme fra listen.</Typography>
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
					// No persistent selection: each row opens details directly
					const isSelected = false;
					// Extract brand name by removing leading emoji
					const brand = (item.category || '').replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').trim();
					const logo = brandLogos[brand];

					return (
						<TouchableOpacity 
							onPress={() => selectProduct(item)} 
							style={[styles.item, isSelected && styles.selectedItem]}
							activeOpacity={0.7}
						>
							<View style={styles.productItem}>
								{logo ? (
									<Image source={logo} style={styles.brandLogo} resizeMode="contain" />
								) : null}

								<View style={styles.productInfo}>
									<Typography style={styles.itemText}>{item.name}</Typography>
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
		</View>
	);
}
