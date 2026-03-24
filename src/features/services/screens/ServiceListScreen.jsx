import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, Image, useWindowDimensions, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Broom, Plus, Tag } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchCategoriesThunk, fetchServicesThunk } from '../servicesSlice';
import { Colors, shadowCard, shadowCTA, pressedStyle, pressedStyleSmall, layoutContainer, } from '@/theme/tokens';
import ListSearchBar from '@/components/ListSearchBar';
import FilterChips from '@/components/FilterChips';
// ─── Format helpers ──────────────────────────────────────────────
function formatPrice(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
}
// ─── Service card ────────────────────────────────────────────────
function ServiceCard({ service, onPress, isAdmin, cardWidth, compact, }) {
    const [imageFailed, setImageFailed] = useState(false);
    useEffect(() => {
        setImageFailed(false);
    }, [service.image]);
    return (<Pressable onPress={onPress} className="mb-4 overflow-hidden rounded-[26px] border border-slate-100 bg-white" style={({ pressed }) => [shadowCard, pressedStyle(pressed), { width: cardWidth }]}>
      <View className="relative">
        {service.image && !imageFailed ? (<Image source={{ uri: service.image }} className={`${compact ? 'h-36' : 'h-44'} w-full bg-slate-100`} resizeMode="cover" onError={() => setImageFailed(true)}/>) : (<View className={`${compact ? 'h-36' : 'h-44'} w-full items-center justify-center bg-indigo-50`}>
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white/80">
              <Broom size={30} color={Colors.indigo600} weight="bold"/>
            </View>
          </View>)}

        <View className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5">
          <View className="flex-row items-center gap-1.5">
            <Tag size={12} color={Colors.slate500} weight="bold"/>
            <Text className="text-[11px] font-bold text-slate-600">
              {service.category || 'Dịch vụ'}
            </Text>
          </View>
        </View>

        {isAdmin && service.active === false && (<View className="absolute right-3 top-3 rounded-full bg-red-50 px-3 py-1.5">
            <Text className="text-[11px] font-extrabold text-red-600">
              Đang ẩn
            </Text>
          </View>)}
      </View>

      <View className="p-4">
        <Text className={`${compact ? 'text-[15px]' : 'text-base'} font-extrabold text-slate-900`} numberOfLines={2}>
          {service.name}
        </Text>
        <Text className="mt-1 text-xs font-medium text-slate-400" numberOfLines={1}>
          Tính theo /{service.unit || 'món'}
        </Text>

        <View className={`mt-4 ${compact ? 'gap-3' : 'flex-row items-end justify-between'}`}>
          <View className={compact ? '' : 'flex-1 pr-3'}>
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-slate-400">
              {compact ? 'Giá' : 'Giá dịch vụ'}
            </Text>
            <Text className={`${compact ? 'text-[18px]' : 'text-xl'} mt-1 font-extrabold text-slate-900`} numberOfLines={1}>
              {formatPrice(service.price)}
            </Text>
          </View>

          <View className={`rounded-2xl bg-indigo-50 ${compact ? 'self-start px-4 py-2.5' : 'px-3 py-2'}`}>
            <Text className="text-xs font-extrabold text-indigo-600">
              Chi tiết
            </Text>
          </View>
        </View>
      </View>
    </Pressable>);
}
// ─── Empty state ─────────────────────────────────────────────────
function EmptyState() {
    return (<View className="flex-1 items-center justify-center py-20">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <Broom size={32} color={Colors.indigo600} weight="bold"/>
      </View>
      <Text className="text-lg font-extrabold text-slate-900">
        Chưa có dịch vụ
      </Text>
      <Text className="mt-2 text-sm font-medium text-slate-500">
        Danh sách dịch vụ sẽ hiển thị ở đây
      </Text>
    </View>);
}
// ─── Main screen ─────────────────────────────────────────────────
export default function ServiceListScreen({ navigation }) {
    const dispatch = useAppDispatch();
    const { list, categories, isLoading, error } = useAppSelector((s) => s.services);
    const userRole = useAppSelector((s) => s.auth.user?.role);
    const isAdmin = userRole === 'admin';
    const { width } = useWindowDimensions();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [visibilityFilter, setVisibilityFilter] = useState('all');
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 250);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);
    useEffect(() => {
        dispatch(fetchCategoriesThunk());
    }, [dispatch]);
    useEffect(() => {
        dispatch(fetchServicesThunk(undefined));
    }, [dispatch]);
    const handleRefresh = useCallback(() => {
        dispatch(fetchServicesThunk(undefined));
    }, [dispatch]);
    const categoryOptions = useMemo(() => ([
        { label: 'Tất cả', value: 'all' },
        ...categories.map((category) => ({
            label: category,
            value: category,
        })),
    ]), [categories]);
    const visibilityOptions = useMemo(() => ([
        { label: 'Tất cả', value: 'all' },
        { label: 'Đang hoạt động', value: 'active' },
        { label: 'Đang ẩn', value: 'hidden' },
    ]), []);
    const filteredServices = useMemo(() => {
        const normalizedSearch = debouncedSearch.toLowerCase();
        return list.filter((service) => {
            if (categoryFilter !== 'all' && service.category !== categoryFilter) {
                return false;
            }
            if (visibilityFilter === 'active' && service.active === false) {
                return false;
            }
            if (visibilityFilter === 'hidden' && service.active !== false) {
                return false;
            }
            if (!normalizedSearch) {
                return true;
            }
            const haystack = [service.name, service.category, service.unit]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(normalizedSearch);
        });
    }, [categoryFilter, debouncedSearch, list, visibilityFilter]);
    const horizontalPadding = 48;
    const columnGap = 12;
    const contentWidth = Math.min(width, layoutContainer.maxWidth) - horizontalPadding;
    const numColumns = contentWidth >= 420 ? 2 : 1;
    const cardWidth = numColumns === 2
        ? Math.floor((contentWidth - columnGap) / 2)
        : Math.max(contentWidth, 0);
    const compactCard = numColumns === 2 && cardWidth < 220;
    const renderItem = useCallback(({ item }) => (<ServiceCard service={item} isAdmin={isAdmin} cardWidth={cardWidth} compact={compactCard} onPress={() => navigation.navigate('ServiceDetail', { serviceId: item._id })}/>), [cardWidth, compactCard, isAdmin, navigation]);
    return (<SafeAreaView className="flex-1 bg-page">
      {/* Header */}
      <View className="px-6 pb-2 pt-4">
        <Text className="text-2xl font-extrabold text-slate-900">Dịch vụ</Text>
      </View>

      <View className="px-6 pb-4">
        <ListSearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Tìm theo tên dịch vụ hoặc danh mục..." isLoading={isLoading}/>
        <View className="mt-3">
          <FilterChips options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter}/>
        </View>
        {isAdmin && (<View className="mt-3">
            <FilterChips options={visibilityOptions} value={visibilityFilter} onChange={setVisibilityFilter}/>
          </View>)}
      </View>

      {/* Error */}
      {error && (<View className="mx-6 mb-2 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>)}

      <FlatList data={filteredServices} renderItem={renderItem} keyExtractor={(item) => item._id} numColumns={numColumns} key={numColumns} columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : undefined} contentContainerStyle={[layoutContainer, { paddingHorizontal: 24 }]} contentContainerClassName="pb-24" ListEmptyComponent={!isLoading ? (searchQuery.trim() || categoryFilter !== 'all' || visibilityFilter !== 'all' ? (<View className="flex-1 items-center justify-center py-20">
              <Text className="text-lg font-extrabold text-slate-900">
                Không tìm thấy dịch vụ phù hợp
              </Text>
              <Text className="mt-2 text-sm font-medium text-slate-500">
                Thử đổi từ khóa hoặc bộ lọc để xem thêm kết quả.
              </Text>
            </View>) : <EmptyState />) : null} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[Colors.indigo600]} tintColor={Colors.indigo600}/>}/>

      {/* FAB — Admin only */}
      {userRole === 'admin' && (<Pressable onPress={() => navigation.navigate('ServiceForm', undefined)} className="absolute bottom-28 right-6 h-14 w-14 items-center justify-center rounded-full bg-slate-900" style={({ pressed }) => [shadowCTA, pressedStyleSmall(pressed)]}>
          <Plus size={24} color="#fff" weight="bold"/>
        </Pressable>)}
    </SafeAreaView>);
}
