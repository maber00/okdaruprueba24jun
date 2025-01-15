// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { adminService } from '@/app/services/adminService';

export async function GET() {
  try {
    const stats = await adminService.getUserStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}