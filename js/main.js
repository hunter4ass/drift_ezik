let app = new Vue({
    el: '#app',
    data: {
        link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
        product: "Socks" ,
        description: "A pair of warm, fuzzy socks" ,
        image: "./assets/vmSocks-blue-onWhite.jpg" ,
        altText: "A pair of socks" ,
        inStock: false,
        inventory: 10 ,
        onSale: "On Sale" ,
        details: ['80% cotton', '20% polyester', 'Gender-neutral'] ,
        variants: [
            {
                variantId: 2234,
                variantColor: 'green',
                variantImage: "./assets/vmSocks-green-onWhite.jpg",
            },
            {
                variantId: 2235,
                variantColor: 'blue',
                variantImage: "./assets/vmSocks-blue-onWhite.jpg",
            }
        ] ,
        sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] ,
        cart: 0 ,



    } ,
    methods: {
        addToCart() {
            this.cart += 1
        } ,

        updateProduct(variantImage) {
            this.image = variantImage
        },

        delToCart() {
            if (this.cart > 0) {
                this.cart -= 1
            }

        } ,


    }

})


