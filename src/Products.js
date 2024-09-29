import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Products.module.css';

const Products = () => {
  const [products, setProducts] = useState([]); // State for products
  const [categories, setCategories] = useState([]); // State for categories
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [limit] = useState(10); // Number of items per page

  // Get current URL query params
  const location = useLocation();
  const navigate = useNavigate();

  // Function to extract query parameters
  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      selectedCategory: params.get('category') || '',
      searchQuery: params.get('search') || '',
      page: parseInt(params.get('page'), 10) || 1,
    };
  };

  const { selectedCategory, searchQuery, page } = getQueryParams();

  // Fetch category list when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products/category-list');
        const data = await response.json();
        setCategories(data); // Set categories from the array
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products based on the selected category, search query, or all products
  useEffect(() => {
    const fetchProducts = async () => {
      const skip = (page - 1) * limit; // Calculate the number of items to skip
      let url = '';

      // Check if there's a search query
      if (searchQuery) {
        url = `https://dummyjson.com/products/search?q=${searchQuery}&limit=${limit}&skip=${skip}`;
      } else if (selectedCategory) {
        url = `https://dummyjson.com/products/category/${selectedCategory}?limit=${limit}&skip=${skip}`;
      } else {
        url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`; // Fetch all products with pagination
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        setProducts(data.products); // Set products based on the response
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, page, limit]);

  // Update the URL when category or search input changes
  const updateQueryParams = (newCategory, newSearchQuery, newPage) => {
    const params = new URLSearchParams();
    if (newCategory) params.set('category', newCategory);
    if (newSearchQuery) params.set('search', newSearchQuery);
    if (newPage) params.set('page', newPage);

    navigate(`?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Product List</h1>

      {/* Search Input */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => updateQueryParams(selectedCategory, e.target.value, 1)}
          className={styles.searchInput}
        />
        <button
          onClick={() => {
            updateQueryParams(selectedCategory, searchQuery, 1);
          }}
          className={styles.searchButton}
        >
          Search
        </button>
      </div>

      {/* Category Selection Dropdown */}
      <div className={styles.categorySelector}>
        <label htmlFor="category">Select Category: </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => updateQueryParams(e.target.value, '', 1)}
          className={styles.selectBox}
        >
          <option value="">-- Select a Category --</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category[0].toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Display Products */}
      <ul className={styles.productList}>
        {products.length > 0 ? (
          products.map((product) => (
            <li key={product.id} className={styles.productItem}>
              <img
                src={product.thumbnail}
                alt={product.title}
                className={styles.productImage}
              />
              <h2 className={styles.productTitle}>{product.title}</h2>
              <p className={styles.productPrice}>Price: ${product.price}</p>
            </li>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </ul>

      {/* Pagination Controls */}
      <div className={styles.pagination}>
        <button 
          onClick={() => updateQueryParams(selectedCategory, searchQuery, page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button 
          onClick={() => updateQueryParams(selectedCategory, searchQuery, page + 1)}
          disabled={products.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Products;
