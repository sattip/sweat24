import { apiRequest } from '../../config/api';

export interface PartnerBusiness {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  address: string;
  phone: string;
  is_active: boolean;
  offers?: PartnerOffer[];
}

export interface PartnerOffer {
  id: number;
  partner_business_id: number;
  title: string;
  description: string;
  discount_percentage: number;
  promo_code: string;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
}

export interface OfferRedemption {
  id: number;
  partner_offer_id: number;
  user_id: number;
  redemption_code: string;
  redeemed_at: string;
  used_at: string | null;
  verification_code: string;
  user?: {
    name: string;
    email: string;
  };
  offer?: PartnerOffer;
}

export const partnersApi = {
  // Partners
  getPartners: async (): Promise<PartnerBusiness[]> => {
    return apiRequest('/admin/partners');
  },

  createPartner: async (data: Partial<PartnerBusiness>): Promise<PartnerBusiness> => {
    return apiRequest('/admin/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePartner: async (id: number, data: Partial<PartnerBusiness>): Promise<PartnerBusiness> => {
    return apiRequest(`/admin/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePartner: async (id: number): Promise<void> => {
    return apiRequest(`/admin/partners/${id}`, {
      method: 'DELETE',
    });
  },

  // Offers
  getOffers: async (): Promise<PartnerOffer[]> => {
    return apiRequest('/admin/partner-offers');
  },

  createOffer: async (data: Partial<PartnerOffer>): Promise<PartnerOffer> => {
    return apiRequest('/admin/partner-offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateOffer: async (id: number, data: Partial<PartnerOffer>): Promise<PartnerOffer> => {
    return apiRequest(`/admin/partner-offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteOffer: async (id: number): Promise<void> => {
    return apiRequest(`/admin/partner-offers/${id}`, {
      method: 'DELETE',
    });
  },

  // Redemptions
  getRedemptions: async (): Promise<OfferRedemption[]> => {
    return apiRequest('/admin/partner-redemptions');
  },
};