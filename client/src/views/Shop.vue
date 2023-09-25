<template>
    <div>
        <h2>Shop</h2>
        <ItemList />
    </div>
</template>
<script>

import ItemList from '@/components/shop/ItemList';

export default {
    name: 'Shop',
    components: {
        ItemList
    }
}
</script>