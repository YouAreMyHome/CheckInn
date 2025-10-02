# 🏗️ Coding Standards - CheckInn OTA

## 📋 Tổng Quan

Coding standards này đảm bảo code consistency, maintainability, và team collaboration hiệu quả. Tất cả team members phải follow các quy tắc này.

---

## 📁 File & Folder Naming

### Folder Structure

```
src/
├── components/          # PascalCase for component folders
│   ├── common/         # lowercase for category folders
│   ├── auth/
│   └── booking/
├── pages/              # PascalCase for page files
├── utils/              # lowercase for utility folders
├── constants/          # lowercase
└── services/           # lowercase
```

### File Naming Conventions

```bash
# React Components - PascalCase
Button.jsx
HotelCard.jsx
BookingWizard.jsx

# Pages - PascalCase + Page suffix
HomePage.jsx
LoginPage.jsx
HotelDetailPage.jsx

# Utilities - camelCase
dateUtils.js
validationUtils.js
formatters.js

# Constants - camelCase
apiEndpoints.js
appConstants.js
themeConfig.js

# Hooks - camelCase với use prefix
useAuth.js
useBooking.js
useLocalStorage.js
```

---

## 🧩 React Component Standards

### Component Structure

```jsx
// 1. Imports (grouped và sorted)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// 2. External components/utilities
import { formatCurrency } from "../utils";
import Button from "../common/Button";

// 3. Component definition
const ComponentName = ({
  // Required props first
  title,
  onSubmit,

  // Optional props with defaults
  variant = "primary",
  disabled = false,

  // Event handlers
  onClick,
  onChange,

  // Style props
  className = "",

  // Children
  children,

  // Rest props
  ...rest
}) => {
  // 4. Hooks (useState, useEffect, custom hooks)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 5. Computed values (useMemo, useCallback)
  const computedValue = useMemo(() => {
    return expensiveCalculation(title);
  }, [title]);

  const handleClick = useCallback(
    (event) => {
      if (disabled) return;
      onClick?.(event);
    },
    [disabled, onClick]
  );

  // 6. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 7. Helper functions
  const helperFunction = () => {
    // Local helper logic
  };

  // 8. Early returns
  if (!title) {
    return null;
  }

  // 9. Render
  return (
    <div className={`component-wrapper ${className}`} {...rest}>
      {children}
    </div>
  );
};

// 10. PropTypes
ComponentName.propTypes = {
  title: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary"]),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};

// 11. Default export
export default ComponentName;
```

### Hooks Guidelines

```jsx
// ✅ Good - Destructured state updates
const [user, setUser] = useState({
  name: "",
  email: "",
  role: "customer",
});

const updateUser = (field, value) => {
  setUser((prev) => ({
    ...prev,
    [field]: value,
  }));
};

// ❌ Bad - Direct state mutation
const updateUser = (field, value) => {
  user[field] = value;
  setUser(user);
};

// ✅ Good - Proper dependency arrays
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Bad - Missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// ✅ Good - useCallback for event handlers
const handleSubmit = useCallback(
  async (formData) => {
    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  },
  [onSubmit]
);

// ✅ Good - useMemo for expensive calculations
const filteredHotels = useMemo(() => {
  return hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [hotels, searchTerm]);
```

---

## 💾 State Management

### Context Pattern

```jsx
// BookingContext.jsx
import React, { createContext, useContext, useReducer } from "react";

// 1. Initial state
const initialState = {
  step: 1,
  hotel: null,
  selectedRoom: null,
  dates: {
    checkIn: "",
    checkOut: "",
    nights: 0,
  },
  guests: {
    adults: 1,
    children: 0,
    rooms: 1,
  },
};

// 2. Action types
const ACTIONS = {
  UPDATE_STEP: "UPDATE_STEP",
  UPDATE_HOTEL: "UPDATE_HOTEL",
  UPDATE_ROOM: "UPDATE_ROOM",
  UPDATE_DATES: "UPDATE_DATES",
  UPDATE_GUESTS: "UPDATE_GUESTS",
  RESET_BOOKING: "RESET_BOOKING",
};

// 3. Reducer function
const bookingReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.UPDATE_STEP:
      return {
        ...state,
        step: action.payload,
      };

    case ACTIONS.UPDATE_HOTEL:
      return {
        ...state,
        hotel: action.payload,
      };

    case ACTIONS.RESET_BOOKING:
      return initialState;

    default:
      return state;
  }
};

// 4. Context creation
const BookingContext = createContext();

// 5. Provider component
export const BookingProvider = ({ children, initialData = {} }) => {
  const [state, dispatch] = useReducer(bookingReducer, {
    ...initialState,
    ...initialData,
  });

  // Action creators
  const updateStep = (step) => {
    dispatch({ type: ACTIONS.UPDATE_STEP, payload: step });
  };

  const updateHotel = (hotel) => {
    dispatch({ type: ACTIONS.UPDATE_HOTEL, payload: hotel });
  };

  const resetBooking = () => {
    dispatch({ type: ACTIONS.RESET_BOOKING });
  };

  const value = {
    // State
    ...state,

    // Actions
    updateStep,
    updateHotel,
    resetBooking,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

// 6. Custom hook
export const useBooking = () => {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }

  return context;
};
```

---

## 🎨 Styling Standards

### Tailwind CSS Guidelines

```jsx
// ✅ Good - Logical grouping
<div className={`
  // Layout
  flex flex-col items-center justify-between

  // Spacing
  p-6 m-4 space-y-4

  // Sizing
  w-full max-w-md h-auto

  // Colors & Background
  bg-white text-gray-900 border-gray-200

  // Typography
  text-lg font-semibold leading-tight

  // Effects
  shadow-md rounded-lg

  // States
  hover:bg-gray-50 focus:ring-2 focus:ring-blue-500

  // Responsive
  md:flex-row md:p-8 lg:max-w-lg
`}>

// ❌ Bad - No organization
<div className="flex w-full hover:bg-gray-50 text-lg bg-white p-6 shadow-md focus:ring-2 rounded-lg">

// ✅ Good - Conditional classes
const buttonClasses = `
  px-4 py-2 rounded-lg font-medium transition-colors
  ${variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
  }
  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  ${className}
`;

// ✅ Good - Component variants
const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};
```

### CSS Custom Properties

```css
/* globals.css */
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

---

## 🔧 Utility Functions

### Function Naming

```javascript
// ✅ Good - Descriptive function names
const formatCurrency = (amount, currency = "VND") => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(amount);
};

const calculateNights = (checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ❌ Bad - Unclear function names
const format = (amount) => {
  /* ... */
};
const calc = (d1, d2) => {
  /* ... */
};
const validate = (input) => {
  /* ... */
};
```

### Error Handling

```javascript
// ✅ Good - Proper error handling
const fetchHotelData = async (hotelId) => {
  try {
    const response = await api.get(`/hotels/${hotelId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch hotel data");
    }

    return response.data.data;
  } catch (error) {
    // Log error for debugging
    console.error("fetchHotelData error:", error);

    // Re-throw with user-friendly message
    throw new Error(
      error.response?.data?.message ||
        "Không thể tải thông tin khách sạn. Vui lòng thử lại."
    );
  }
};

// ✅ Good - Component error boundaries
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error("Error boundary caught:", error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return fallback || <div>Something went wrong.</div>;
  }

  return children;
};
```

---

## 📊 Performance Standards

### React Performance

```jsx
// ✅ Good - React.memo for expensive components
const HotelCard = React.memo(
  ({ hotel, onSelect, onFavorite }) => {
    return <div className="hotel-card">{/* Component content */}</div>;
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.hotel.id === nextProps.hotel.id &&
      prevProps.hotel.price === nextProps.hotel.price
    );
  }
);

// ✅ Good - Lazy loading
const LazyHotelDetail = React.lazy(() => import("../pages/HotelDetailPage"));

const App = () => (
  <Suspense fallback={<Loading />}>
    <LazyHotelDetail />
  </Suspense>
);

// ✅ Good - Optimized lists
const HotelList = ({ hotels }) => {
  return (
    <div className="hotel-list">
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id} // Stable keys
          hotel={hotel}
          onSelect={handleSelect}
          onFavorite={handleFavorite}
        />
      ))}
    </div>
  );
};

// ❌ Bad - Creating functions in render
const HotelList = ({ hotels }) => {
  return (
    <div>
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          onSelect={() => handleSelect(hotel.id)} // New function every render
        />
      ))}
    </div>
  );
};
```

### Image Optimization

```jsx
// ✅ Good - Optimized images
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  loading = "lazy",
}) => {
  const [imageSrc, setImageSrc] = useState("/placeholder.jpg");
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setImageLoading(false);
    };
    img.onerror = () => {
      setImageSrc("/error-placeholder.jpg");
      setImageLoading(false);
    };
    img.src = src;
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={`transition-opacity duration-300 ${
          imageLoading ? "opacity-50" : "opacity-100"
        }`}
      />
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
};
```

---

## 🧪 Testing Standards

### Component Testing

```javascript
// HotelCard.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HotelCard from "./HotelCard";

// Mock data
const mockHotel = {
  id: "1",
  name: "Test Hotel",
  price: 1000000,
  rating: 4.5,
  image: "/test-image.jpg",
};

describe("HotelCard", () => {
  // Test rendering
  test("renders hotel information correctly", () => {
    render(<HotelCard hotel={mockHotel} />);

    expect(screen.getByText("Test Hotel")).toBeInTheDocument();
    expect(screen.getByText("1,000,000 ₫")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  // Test interactions
  test("calls onSelect when clicked", async () => {
    const handleSelect = jest.fn();
    const user = userEvent.setup();

    render(<HotelCard hotel={mockHotel} onSelect={handleSelect} />);

    const card = screen.getByRole("button");
    await user.click(card);

    expect(handleSelect).toHaveBeenCalledWith(mockHotel.id);
  });

  // Test loading states
  test("shows loading state when image is loading", () => {
    render(<HotelCard hotel={mockHotel} loading={true} />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  // Test error states
  test("shows error message when hotel data is invalid", () => {
    const invalidHotel = { ...mockHotel, name: "" };

    render(<HotelCard hotel={invalidHotel} />);

    expect(screen.getByText("Invalid hotel data")).toBeInTheDocument();
  });
});

// Integration testing
describe("HotelCard Integration", () => {
  test("works with booking flow", async () => {
    const { getByText, getByRole } = render(
      <BookingProvider>
        <HotelCard hotel={mockHotel} />
      </BookingProvider>
    );

    const selectButton = getByRole("button", { name: /select/i });
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(getByText("Hotel selected")).toBeInTheDocument();
    });
  });
});
```

### API Testing

```javascript
// hotelService.test.js
import { fetchHotel, searchHotels } from "./hotelService";
import { server } from "../mocks/server";

describe("Hotel Service", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("fetchHotel returns hotel data", async () => {
    const hotel = await fetchHotel("1");

    expect(hotel).toEqual({
      id: "1",
      name: "Test Hotel",
      rating: 4.5,
    });
  });

  test("searchHotels with filters", async () => {
    const filters = {
      location: "Ho Chi Minh",
      minPrice: 500000,
      maxPrice: 2000000,
    };

    const results = await searchHotels(filters);

    expect(results.hotels).toHaveLength(5);
    expect(results.total).toBe(10);
  });
});
```

---

## 📝 Documentation Standards

### JSDoc Comments

```javascript
/**
 * Calculates the total price for a booking including taxes and fees
 * @param {Object} booking - The booking object
 * @param {number} booking.roomPrice - Base room price per night
 * @param {number} booking.nights - Number of nights
 * @param {number} booking.rooms - Number of rooms
 * @param {Object} options - Additional options
 * @param {boolean} options.includeTax - Whether to include tax in calculation
 * @param {number} options.discountPercent - Discount percentage (0-100)
 * @returns {Object} Price breakdown object
 * @throws {Error} When booking data is invalid
 *
 * @example
 * const pricing = calculateBookingPrice(
 *   { roomPrice: 1000000, nights: 2, rooms: 1 },
 *   { includeTax: true, discountPercent: 10 }
 * );
 * console.log(pricing.total); // 1,980,000
 */
const calculateBookingPrice = (booking, options = {}) => {
  // Function implementation
};
```

### README Documentation

````markdown
# Component Name

Brief description of what this component does.

## Props

| Prop    | Type                     | Default   | Required | Description          |
| ------- | ------------------------ | --------- | -------- | -------------------- |
| title   | string                   | -         | Yes      | The title to display |
| variant | 'primary' \| 'secondary' | 'primary' | No       | Visual variant       |
| onClick | function                 | -         | No       | Click handler        |

## Usage

```jsx
import ComponentName from "./ComponentName";

const Example = () => {
  return (
    <ComponentName
      title="Hello World"
      variant="primary"
      onClick={handleClick}
    />
  );
};
```
````

## Styling

This component uses Tailwind CSS classes. You can override styles using the `className` prop.

## Accessibility

- Supports keyboard navigation
- Screen reader compatible
- ARIA labels included

```

---

## 🔍 Code Review Checklist

### Before Submitting PR
- [ ] Code follows naming conventions
- [ ] Components have PropTypes
- [ ] Functions have proper error handling
- [ ] No console.logs in production code
- [ ] Tests written for new features
- [ ] Documentation updated
- [ ] Performance considerations addressed
- [ ] Accessibility guidelines followed

### Review Criteria
- [ ] Code readability and clarity
- [ ] Proper separation of concerns
- [ ] Error handling implementation
- [ ] Performance optimization
- [ ] Security considerations
- [ ] Test coverage adequate
- [ ] Documentation complete

---

*Last Updated: September 22, 2025*
*Version: 1.0.0*
```
