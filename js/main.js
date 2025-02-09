let eventBus = new Vue();
Vue.component('product-tabs', {



    props: {
        reviews: {
            type: Array,
            required: true
        },
        shippingCost: {
            type: String,
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
   <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews" :key="review.name">
           <p>{{ review.name }}</p>
           <p>Rating: {{ review.rating }}</p>
           <p>{{ review.review }}</p>
           <p>you recommend this product:{{ review.recomend }}</p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review @review-submitted="addReview"></product-review>
       </div>
       <div v-show="selectedTab === 'Shipping'">
         <p>Shipping cost: {{ shippingCost }}</p>
       </div>
       <div v-show="selectedTab === 'Details'">
         <ul>
           <li v-for="detail in details" :key="detail">{{ detail }}</li>
         </ul>
       </div>
     </div>
 `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    },
    methods: {
        addReview(review) {
            this.$emit('review-submitted', review);
        }
    }
});

Vue.component('product-review', {
    template: `
<form class="review-form" @submit.prevent="onSubmit">
<p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>
</p>
 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name">
 </p>
 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review"></textarea>
 </p>
 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
 </p>
 <p>
   <label>Would you recommend this product?</label>
   
  <lable>
  <input type="radio" value="yes" v-model="recomend">yes
  </lable>
    <lable>
  <input type="radio" value="no" v-model="recomend">no
  </lable>
   
 </p>
 <p>
   <input type="submit" value="Submit"> 
 </p>
</form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recomend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recomend: this.recomend
                };
                eventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recomend = null;
            } else {
                if (!this.name) this.errors.push("Name required.");
                if (!this.review) this.errors.push("Review required.");
                if (!this.rating) this.errors.push("Rating required.");
                if (!this.recomend) this.errors.push("Recommendation required.");
            }
        }
    }
});

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
      <ul>
         <li v-for="detail in details" :key="detail">{{ detail }}</li>
      </ul>
    `
});

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
   <div class="product">
    <div class="product-image">
      <img :src="image" :alt="altText"/>
    </div>
    <div class="product-info">
      <h1>{{ title }}</h1>
      <p>{{description}}</p>
      <a :href="link">More products like this</a>
      <p v-if="inStock">In stock</p>
      <p v-else :class="{ strikethrough: !inStock }">Out of stock</p>
      <span>{{sale}}</span>
      <div
              class="color-box"
              v-for="(variant, index) in variants"
              :key="variant.variantId"
              :style="{ backgroundColor:variant.variantColor }"
              @mouseover="updateProduct(index)"
      >
      </div>
      <ul>
      <li v-for="size in sizes">{{size}}</li>
      </ul>
      <p>Materials: {{ material }}</p> 
      <p>Price: {{ price }}</p> 
      <button
              v-on:click="addToCart"
              :disabled="!inStock"
              :class="{ disabledButton: !inStock }"
      >
        Add to cart
      </button>
      <button v-on:click="delCart">del to cart</button>
   </div>
   <product-tabs :reviews="reviews" :shipping-cost="shipping" :details="details" @review-submitted="addReview"></product-tabs>
 ` ,
    data() {
        return {
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            onSale: false,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10 ,
                    basePrice: 25,
                    materials: [
                        { name: 'Cotton', coefficient: 0.5 },
                        { name: 'Polyester', coefficient: 0.5 }
                    ]
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 10,
                    basePrice: 19,
                    materials: [
                        { name: 'wool', coefficient: 0.4 },
                        { name: 'neilon', coefficient: 0.2 },
                        { name: 'barashek', coefficient: 0.4 }
                    ]
                }
            ],
            reviews: [],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            cart: 0,
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        delCart() {
            this.$emit('delete-cart', this.variants[this.selectedVariant].variantId);
        },
        addReview(review) {
            this.reviews.push(review);
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        });
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        sale() {
            return this.onSale
                ? `Сейчас распродажа на ${this.brand} ${this.product}!`
                : `На ${this.brand} ${this.product} распродаж нет.`;
        },
        shipping() {
            return this.premium ? "Free" : 2.99;
        },
        material() {
            return this.variants[this.selectedVariant].materials.map(material => material.name).join(' , ');
        },
        price() {
            const basePrice = this.variants[this.selectedVariant].basePrice;
            const totalCoefficient = this.variants[this.selectedVariant].materials.reduce((total, material) => total + material.coefficient, 1);
            return (basePrice * totalCoefficient).toFixed(2);
        },
    },
});

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        delCart(id) {
            const index = this.cart.indexOf(id);
            if (index > -1) {
                this.cart.splice(index, 1);
            }
        }
    }
});