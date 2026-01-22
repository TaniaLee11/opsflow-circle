import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CohortStatus {
  isActiveCohort: boolean;
  expiresAt: Date | null;
  daysRemaining: number | null;
  isLoading: boolean;
}

export function useCohortStatus(): CohortStatus {
  const { user, isOwner } = useAuth();
  const [status, setStatus] = useState<CohortStatus>({
    isActiveCohort: false,
    expiresAt: null,
    daysRemaining: null,
    isLoading: true,
  });

  useEffect(() => {
    // Platform owners are never cohort users
    if (!user || isOwner) {
      setStatus({
        isActiveCohort: false,
        expiresAt: null,
        daysRemaining: null,
        isLoading: false,
      });
      return;
    }

    const fetchCohortStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("cohort_memberships")
          .select("expires_at, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (error) {
          console.error("Error fetching cohort status:", error);
          setStatus({
            isActiveCohort: false,
            expiresAt: null,
            daysRemaining: null,
            isLoading: false,
          });
          return;
        }

        if (data && data.expires_at) {
          const expiresAt = new Date(data.expires_at);
          const now = new Date();
          const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          setStatus({
            isActiveCohort: true,
            expiresAt,
            daysRemaining: Math.max(0, daysRemaining),
            isLoading: false,
          });
        } else {
          setStatus({
            isActiveCohort: false,
            expiresAt: null,
            daysRemaining: null,
            isLoading: false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch cohort status:", err);
        setStatus({
          isActiveCohort: false,
          expiresAt: null,
          daysRemaining: null,
          isLoading: false,
        });
      }
    };

    fetchCohortStatus();
  }, [user, isOwner]);

  return status;
}
