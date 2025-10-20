import React, { useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { openProductDetail } from '../utils/navigationRef';
import { Ionicons } from '@expo/vector-icons';
import { makeStyles } from '../styles/SearchScreen.styles';
import { useTheme } from '../styles/ThemeContext';
import Typography from '../components/Typography';
import { moisturizerSections } from '../data/moisturizers';

export default function SearchScreen() {
	const navigation = useNavigation();
	const { theme } = useTheme();
	const styles = useMemo(() => makeStyles(theme), [theme]);
	const [query, setQuery] = useState('');
	const [selected, setSelected] = useState(null);

	// Flet sektioner til en flad liste af produkter
	const flatProducts = useMemo(() => {
		return moisturizerSections.flatMap(section => 
			section.data.map(product => ({
				name: product,
				category: section.title,
				id: `${section.title}-${product}`
			}))
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
		setSelected(product);
	};

	const navigateToDetail = () => {
		if (selected) {
				openProductDetail(navigation, selected);
			}
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
			{selected && (
				<View style={styles.selectedContainer}>
					<View style={styles.selectedInfo}>
						<Ionicons name="checkmark-circle" size={20} color={theme.colors.success || theme.colors.primary} />
						<View style={styles.selectedTextContainer}>
							<Typography variant="small" style={styles.selectedProductName}>
								{selected.name}
							</Typography>
							<Typography variant="small" muted style={styles.selectedCategoryText}>
								{selected.category}
							</Typography>
						</View>
					</View>
					<TouchableOpacity 
						style={styles.detailButton}
						onPress={navigateToDetail}
						activeOpacity={0.8}
					>
						<Typography variant="small" weight="600" style={styles.detailButtonText}>
							Se Detaljer
						</Typography>
						<Ionicons name="arrow-forward" size={16} color="#fff" />
					</TouchableOpacity>
				</View>
			)}
			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => {
					const isSelected = selected?.id === item.id;
					return (
						<TouchableOpacity 
							onPress={() => selectProduct(item)} 
							style={[styles.item, isSelected && styles.selectedItem]}
							activeOpacity={0.7}
						>
							<View style={styles.productItem}>
								<View style={styles.productInfo}>
									<Typography style={styles.itemText}>{item.name}</Typography>
									<Typography variant="small" muted style={styles.categoryText}>
										{item.category}
									</Typography>
								</View>
								<View style={styles.productActions}>
									{isSelected ? (
										<Ionicons name="checkmark-circle" size={24} color={theme.colors.success || theme.colors.primary} />
									) : (
										<Typography variant="small" muted style={styles.tapHint}>
											Tryk for at vælge
										</Typography>
									)}
								</View>
							</View>
						</TouchableOpacity>
					);
				}}
				ListEmptyComponent={
					<Typography muted style={styles.emptyText}>Ingen resultater</Typography>
				}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
}
