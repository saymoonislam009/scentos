// Hand-written to match supabase/migrations/*.sql. Once your Supabase
// project is live, regenerate the real thing with:
//   npx supabase gen types typescript --linked > lib/database.types.ts
// and this file becomes redundant (but the shape should already match).

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          country: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; email: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      follows: {
        Row: { id: string; follower_id: string; following_id: string; created_at: string };
        Insert: { follower_id: string; following_id: string };
        Update: Partial<Database['public']['Tables']['follows']['Row']>;
      };
      brands: {
        Row: { id: string; name: string; country: string | null; tier: string | null; logo_url: string | null };
        Insert: Partial<Database['public']['Tables']['brands']['Row']> & { name: string };
        Update: Partial<Database['public']['Tables']['brands']['Row']>;
      };
      notes: {
        Row: { id: string; name: string };
        Insert: { name: string };
        Update: Partial<{ name: string }>;
      };
      accords: {
        Row: { id: string; name: string };
        Insert: { name: string };
        Update: Partial<{ name: string }>;
      };
      fragrances: {
        Row: {
          id: string;
          slug: string;
          name: string;
          brand_id: string;
          release_year: number | null;
          concentration: string | null;
          description: string | null;
          hero_image_url: string | null;
          longevity_hrs: number | null;
          projection: string | null;
          seasons: string[];
          occasions: string[];
          price_tier_usd: number | null;
          discontinued: boolean;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['fragrances']['Row']> & {
          slug: string;
          name: string;
          brand_id: string;
        };
        Update: Partial<Database['public']['Tables']['fragrances']['Row']>;
      };
      fragrance_notes: {
        Row: { fragrance_id: string; note_id: string; position: string };
        Insert: { fragrance_id: string; note_id: string; position: string };
        Update: Partial<Database['public']['Tables']['fragrance_notes']['Row']>;
      };
      fragrance_accords: {
        Row: { fragrance_id: string; accord_id: string; strength: number };
        Insert: { fragrance_id: string; accord_id: string; strength?: number };
        Update: Partial<Database['public']['Tables']['fragrance_accords']['Row']>;
      };
      dna_scores: {
        Row: {
          id: string;
          fragrance_id: string;
          sweetness: number;
          freshness: number;
          masculine_feminine: number;
          projection: number;
          longevity: number;
          versatility: number;
          sample_size: number;
        };
        Insert: Omit<Database['public']['Tables']['dna_scores']['Row'], 'id' | 'sample_size'> & {
          sample_size?: number;
        };
        Update: Partial<Database['public']['Tables']['dna_scores']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          fragrance_id: string;
          rating: number;
          body: string | null;
          longevity_hrs: number | null;
          projection: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reviews']['Row']> & {
          user_id: string;
          fragrance_id: string;
          rating: number;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
      };
      collection_items: {
        Row: {
          id: string;
          user_id: string;
          fragrance_id: string;
          type: string;
          bottle_size_ml: number | null;
          ml_remaining: number | null;
          purchase_price: number | null;
          purchased_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['collection_items']['Row']> & {
          user_id: string;
          fragrance_id: string;
          type: string;
        };
        Update: Partial<Database['public']['Tables']['collection_items']['Row']>;
      };
      decant_listings: {
        Row: {
          id: string;
          seller_id: string;
          fragrance_id: string;
          ml_amount: number;
          price: number;
          currency: string;
          condition: string;
          status: string;
          photos: string[];
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['decant_listings']['Row']> & {
          seller_id: string;
          fragrance_id: string;
          ml_amount: number;
          price: number;
          condition: string;
        };
        Update: Partial<Database['public']['Tables']['decant_listings']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          status: string;
          tracking_number: string | null;
          escrow_release_at: string | null;
          created_at: string;
        };
        Insert: never; // created only via the create_decant_order() RPC
        Update: never; // mutated only via the escrow RPC functions
      };
      price_points: {
        Row: {
          id: string;
          fragrance_id: string;
          retailer: string;
          price: number;
          currency: string;
          url: string;
          in_stock: boolean;
          captured_at: string;
        };
        Insert: Partial<Database['public']['Tables']['price_points']['Row']> & {
          fragrance_id: string;
          retailer: string;
          price: number;
          url: string;
        };
        Update: Partial<Database['public']['Tables']['price_points']['Row']>;
      };
      price_alerts: {
        Row: {
          id: string;
          user_id: string;
          fragrance_id: string;
          target_price: number;
          triggered_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['price_alerts']['Row']> & {
          user_id: string;
          fragrance_id: string;
          target_price: number;
        };
        Update: Partial<Database['public']['Tables']['price_alerts']['Row']>;
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          fragrance_id: string | null;
          image_url: string | null;
          caption: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['posts']['Row']> & { user_id: string; type: string };
        Update: Partial<Database['public']['Tables']['posts']['Row']>;
      };
      likes: {
        Row: { id: string; user_id: string; post_id: string; created_at: string };
        Insert: { user_id: string; post_id: string };
        Update: never;
      };
      comments: {
        Row: { id: string; user_id: string; post_id: string; body: string; created_at: string };
        Insert: { user_id: string; post_id: string; body: string };
        Update: Partial<{ body: string }>;
      };
      advisor_submissions: {
        Row: { id: string; user_id: string | null; inputs: Json; result_json: Json; created_at: string };
        Insert: { user_id?: string | null; inputs: Json; result_json: Json };
        Update: never;
      };
      chat_sessions: {
        Row: { id: string; user_id: string | null; title: string | null; created_at: string };
        Insert: { user_id?: string | null; title?: string | null };
        Update: never;
      };
      chat_messages: {
        Row: { id: string; session_id: string; role: string; content: string; created_at: string };
        Insert: { session_id: string; role: string; content: string };
        Update: never;
      };
      layering_suggestions: {
        Row: { id: string; user_id: string | null; fragrance_ids: string[]; combination: Json; created_at: string };
        Insert: { user_id?: string | null; fragrance_ids: string[]; combination: Json };
        Update: never;
      };
      partial_bottle_listings: {
        Row: {
          id: string;
          seller_id: string;
          fragrance_id: string | null;
          perfume_name: string;
          brand_name: string | null;
          days_used: number | null;
          percent_left: number;
          has_box: boolean;
          price: number;
          currency: string;
          payment_method: string;
          location: string | null;
          contact_info: string;
          photos: string[];
          description: string | null;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['partial_bottle_listings']['Row']> & {
          seller_id: string;
          perfume_name: string;
          percent_left: number;
          price: number;
          payment_method: string;
          contact_info: string;
        };
        Update: Partial<Database['public']['Tables']['partial_bottle_listings']['Row']>;
      };
      partial_listing_inquiries: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          message: string | null;
          status: string;
          created_at: string;
        };
        Insert: { listing_id: string; buyer_id: string; message?: string | null };
        Update: Partial<{ status: string }>;
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          listing_id: string | null;
          reported_user_id: string | null;
          reason: string;
          details: string | null;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reports']['Row']> & {
          reporter_id: string;
          reason: string;
        };
        Update: Partial<Database['public']['Tables']['reports']['Row']>;
      };
    };
    Views: {};
    Functions: {
      create_decant_order: { Args: { p_listing_id: string }; Returns: Database['public']['Tables']['orders']['Row'] };
      mark_order_shipped: {
        Args: { p_order_id: string; p_tracking_number: string };
        Returns: Database['public']['Tables']['orders']['Row'];
      };
      confirm_order_delivered: {
        Args: { p_order_id: string };
        Returns: Database['public']['Tables']['orders']['Row'];
      };
      dispute_order: { Args: { p_order_id: string }; Returns: Database['public']['Tables']['orders']['Row'] };
      search_fragrances: {
        Args: {
          p_query?: string | null;
          p_season?: string | null;
          p_occasion?: string | null;
          p_max_price_tier?: number | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Database['public']['Tables']['fragrances']['Row'][];
      };
      match_fragrance_genome: {
        Args: { p_fragrance_id: string; p_match_count?: number };
        Returns: { fragrance_id: string; similarity: number }[];
      };
      trending_fragrances: {
        Args: { p_days?: number; p_limit?: number };
        Returns: { fragrance_id: string; name: string; brand_name: string; slug: string; signal_count: number }[];
      };
    };
  };
}
