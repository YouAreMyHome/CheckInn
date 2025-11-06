/**
 * Partner Hook for CheckInn Hotel Booking Platform
 * 
 * Custom hook using TanStack Query for partner data management
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import partnerService from '@services/partnerService';

/**
 * Hook for partner dashboard data
 */
export const usePartnerDashboard = () => {
  return useQuery({
    queryKey: ['partner', 'dashboard'],
    queryFn: partnerService.getDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true
  });
};

/**
 * Hook for partner's hotels
 */
export const usePartnerHotels = () => {
  return useQuery({
    queryKey: ['partner', 'hotels'],
    queryFn: partnerService.getMyHotels,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });
};

/**
 * Hook for partner earnings
 */
export const usePartnerEarnings = (params = {}) => {
  return useQuery({
    queryKey: ['partner', 'earnings', params],
    queryFn: () => partnerService.getEarnings(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    enabled: true
  });
};

/**
 * Hook for onboarding status
 */
export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: ['partner', 'onboarding-status'],
    queryFn: partnerService.getOnboardingStatus,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000,
    retry: 2
  });
};

/**
 * Hook for partner registration (complete - all steps at once)
 * NEW: Recommended approach
 */
export const usePartnerRegisterComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partnerService.registerComplete,
    onSuccess: (data) => {
      // Store token from response
      if (data?.data?.token) {
        localStorage.setItem('token', data.data.token);
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      console.error('Registration failed:', error.message);
    }
  });
};

/**
 * Hook for partner registration mutation (legacy - step 1 only)
 * @deprecated Use usePartnerRegisterComplete instead
 */
export const usePartnerRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partnerService.register,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['partner'] });
    },
    onError: (error) => {
      console.error('Registration failed:', error.message);
    }
  });
};

/**
 * Hook for updating business info
 */
export const useUpdateBusinessInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partnerService.updateBusinessInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'onboarding-status'] });
    }
  });
};

/**
 * Hook for updating bank account
 */
export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partnerService.updateBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'onboarding-status'] });
    }
  });
};

/**
 * Hook for uploading documents
 */
export const useUploadDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partnerService.uploadDocuments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'onboarding-status'] });
    }
  });
};

/**
 * Hook for completing onboarding
 */
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partnerService.completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner'] });
    }
  });
};

/**
 * Combined hook for all partner data
 */
export const usePartner = () => {
  const dashboard = usePartnerDashboard();
  const hotels = usePartnerHotels();
  const onboardingStatus = useOnboardingStatus();

  return {
    dashboard: {
      data: dashboard.data?.data,
      isLoading: dashboard.isLoading,
      isError: dashboard.isError,
      error: dashboard.error,
      refetch: dashboard.refetch
    },
    hotels: {
      data: hotels.data?.data?.hotels || [],
      count: hotels.data?.count || 0,
      isLoading: hotels.isLoading,
      isError: hotels.isError,
      error: hotels.error,
      refetch: hotels.refetch
    },
    onboarding: {
      data: onboardingStatus.data?.data,
      isLoading: onboardingStatus.isLoading,
      isError: onboardingStatus.isError,
      error: onboardingStatus.error,
      refetch: onboardingStatus.refetch
    }
  };
};

export default usePartner;
