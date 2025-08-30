import { NextResponse } from 'next/server'

export async function POST() {
  // Since we're using JWT tokens stored on the client side,
  // logout is handled by the client removing the token from localStorage.
  // This endpoint exists for consistency but doesn't need to do much server-side.
  
  return NextResponse.json({ 
    message: 'Logged out successfully' 
  })
}