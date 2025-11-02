# Import Alias Quick Reference

## ✅ Aliases Available

```javascript
@                  → ./src
@shared            → ./src/shared
@components        → ./src/shared/components
@context           → ./src/shared/context
@hooks             → ./src/shared/hooks
@services          → ./src/shared/services
@utils             → ./src/shared/utils
@assets            → ./src/assets
@styles            → ./src/styles
@portals           → ./src/portals
@customer          → ./src/portals/customer
@admin             → ./src/portals/admin
@partner           → ./src/portals/hotel-manager
```

## 📖 Usage Examples

### Shared Resources
```javascript
// Hooks
import { useAuth } from '@hooks/useAuth';

// Context
import { AuthContext } from '@context/AuthContext';

// Components
import { useNotification } from '@components/NotificationProvider';
import LoadingSpinner from '@components/LoadingSpinner';

// Services
import api from '@services/api';
import { authService } from '@services';

// Utils
import { formatDate } from '@utils/format';
```

### Portal-Specific
```javascript
// Admin Portal
import UserFormModal from '@admin/components/UserFormModal';
import userService from '@admin/services/userService';

// Customer Portal
import HotelCard from '@customer/components/HotelCard';
import bookingService from '@customer/services/bookingService';

// Partner Portal
import RevenueChart from '@partner/components/RevenueChart';
```

## 🛠️ Commands

```bash
# Check for relative imports
npm run check:imports

# Migrate to aliases (preview)
npm run migrate:imports:dry

# Migrate to aliases (apply)
npm run migrate:imports
```

## 📚 Full Documentation

See [IMPORT_ALIAS_SYSTEM.md](./IMPORT_ALIAS_SYSTEM.md) for complete documentation.
