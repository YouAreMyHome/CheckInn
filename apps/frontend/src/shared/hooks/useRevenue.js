/**
 * Revenue Hook for CheckInn Hotel Booking Platform
 * 
 * Custom hook using TanStack Query for revenue data management
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import revenueService from '@services/revenueService';

/**
 * Hook for partner revenue summary
 */
export const usePartnerRevenueSummary = (params = {}) => {
  return useQuery({
    queryKey: ['revenue', 'partner-summary', params],
    queryFn: () => revenueService.getPartnerSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000,
    enabled: true
  });
};

/**
 * Hook for hotel revenue
 */
export const useHotelRevenue = (hotelId, params = {}) => {
  return useQuery({
    queryKey: ['revenue', 'hotel', hotelId, params],
    queryFn: () => revenueService.getHotelRevenue(hotelId, params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    enabled: !!hotelId
  });
};

/**
 * Hook for monthly revenue
 */
export const useMonthlyRevenue = (hotelId, year, month) => {
  return useQuery({
    queryKey: ['revenue', 'monthly', hotelId, year, month],
    queryFn: () => revenueService.getMonthlyRevenue(hotelId, year, month),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000,
    enabled: !!(hotelId && year && month)
  });
};

/**
 * Hook for occupancy rate
 */
export const useOccupancyRate = (hotelId, params = {}) => {
  return useQuery({
    queryKey: ['revenue', 'occupancy', hotelId, params],
    queryFn: () => revenueService.getOccupancyRate(hotelId, params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    enabled: !!hotelId
  });
};

/**
 * Hook for booking trends
 */
export const useBookingTrends = (hotelId, period = '30d') => {
  return useQuery({
    queryKey: ['revenue', 'trends', hotelId, period],
    queryFn: () => revenueService.getBookingTrends(hotelId, period),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    enabled: !!hotelId
  });
};

/**
 * Combined hook for hotel revenue analytics
 */
export const useHotelRevenueAnalytics = (hotelId, dateRange = {}) => {
  const revenue = useHotelRevenue(hotelId, dateRange);
  const occupancy = useOccupancyRate(hotelId, dateRange);
  const trends = useBookingTrends(hotelId, '30d');

  return {
    revenue: {
      data: revenue.data?.data,
      isLoading: revenue.isLoading,
      isError: revenue.isError,
      error: revenue.error,
      refetch: revenue.refetch
    },
    occupancy: {
      data: occupancy.data?.data,
      isLoading: occupancy.isLoading,
      isError: occupancy.isError,
      error: occupancy.error,
      refetch: occupancy.refetch
    },
    trends: {
      data: trends.data?.data,
      isLoading: trends.isLoading,
      isError: trends.isError,
      error: trends.error,
      refetch: trends.refetch
    },
    isLoading: revenue.isLoading || occupancy.isLoading || trends.isLoading,
    isError: revenue.isError || occupancy.isError || trends.isError,
    refetchAll: () => {
      revenue.refetch();
      occupancy.refetch();
      trends.refetch();
    }
  };
};

/**
 * Hook for revenue with date range state management
 */
export const useRevenueWithDateRange = (hotelId, initialStartDate, initialEndDate) => {
  const [dateRange, setDateRange] = useState({
    startDate: initialStartDate || new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: initialEndDate || new Date().toISOString().split('T')[0]
  });

  const revenue = useHotelRevenue(hotelId, dateRange);

  const updateDateRange = (start, end) => {
    setDateRange({
      startDate: start,
      endDate: end
    });
  };

  return {
    ...revenue,
    dateRange,
    updateDateRange
  };
};

/**
 * Default export - main revenue hook
 */
export const useRevenue = (hotelId, params = {}) => {
  return useHotelRevenue(hotelId, params);
};

export default useRevenue;
