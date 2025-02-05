// src/app/services/orderService.ts
'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import type { Order } from '@/app/types/order';

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, 'orders');
      let q;

      if (user.role === 'admin' || user.role === 'project_manager') {
        q = query(ordersRef, orderBy('createdAt', 'desc'));
      } else {
        q = query(
          ordersRef,
          where('clientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
      }

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            dueDate: doc.data().dueDate?.toDate()
          })) as Order[];
          setOrders(ordersData);
          setIsLoading(false);
        },
        (error) => {
          setError(error as Error);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      setError(error as Error);
      setIsLoading(false);
    }
  }, [user]);

  return { orders, isLoading, error };
}