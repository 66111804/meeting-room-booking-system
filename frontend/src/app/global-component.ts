export const GlobalComponent = {
  // Api Calling
  // API_URL : 'https://api-node.themesbrand.website/',
  API_URL : 'http://127.0.0.1:3000/api/',
  headerToken : {'Authorization': `Bearer ${sessionStorage.getItem('token')}`},

  // Auth Api
  // AUTH_API:"https://api-node.themesbrand.website/auth/",
  AUTH_API:"http://127.0.0.1:3000/api/auth/",


  // Products Api
  product:'apps/product',
  productDelete:'apps/product/',

  // Orders Api
  order:'apps/order',
  orderId:'apps/order/',

  // Customers Api
  customer:'apps/customer',
}
