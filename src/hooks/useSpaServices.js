import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import servicesData from '../data/servicesData';

/**
 * useSpaServices - Fuente única de verdad para los rituales y tratamientos del spa.
 * Unifica datos estáticos oficiales con la base de datos Supabase, garantizando que
 * tanto la Carta de Rituales (Services) como el Módulo de Reserva (Booking)
 * muestren siempre los mismos nombres, duraciones y precios en RD$.
 */
export const useSpaServices = () => {
  const [services, setServices] = useState(servicesData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUnifiedServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0 && isMounted) {
          const merged = servicesData.map((fallback, idx) => {
            const remote = data[idx] || data.find((d) => d.id === fallback.id || d.title === fallback.title);
            if (!remote) return fallback;

            return {
              ...fallback,
              title: remote.title || fallback.title,
              duration: remote.duration || fallback.duration,
              price: remote.price || null,
              show_price: Boolean(remote.show_price && remote.price),
              description: remote.description || fallback.description,
            };
          });

          setServices(merged);
        }
      } catch (err) {
        // En caso de fallo o modo sin conexión, usar los 10 rituales curados oficiales
        if (isMounted) setServices(servicesData);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUnifiedServices();

    const subscription = supabase
      .channel('unified-spa-services')
      .on('postgres_changes', { event: '*', table: 'services' }, () => {
        fetchUnifiedServices();
      })
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { services, loading };
};

export default useSpaServices;

