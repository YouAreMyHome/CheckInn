// Common Components Export
import Button from './Button';
import Input from './Input';
import Loading, { LoadingSpinner, LoadingSkeleton, LoadingCard, LoadingTable, PageLoading, OverlayLoading, ButtonLoading } from './Loading';
import Modal, { ConfirmModal, AlertModal } from './Modal';
import Card, { CardHeader, CardBody, CardFooter, HotelCard, StatsCard } from './Card';

// Named exports
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Loading, LoadingSpinner, LoadingSkeleton, LoadingCard, LoadingTable, PageLoading, OverlayLoading, ButtonLoading } from './Loading';
export { default as Modal, ConfirmModal, AlertModal } from './Modal';
export { default as Card, CardHeader, CardBody, CardFooter, HotelCard, StatsCard } from './Card';

// Default export object
const CommonComponents = {
  Button,
  Input,
  Loading,
  LoadingSpinner,
  LoadingSkeleton,
  LoadingCard,
  LoadingTable,
  PageLoading,
  OverlayLoading,
  ButtonLoading,
  Modal,
  ConfirmModal,
  AlertModal,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  HotelCard,
  StatsCard,
};

export default CommonComponents;