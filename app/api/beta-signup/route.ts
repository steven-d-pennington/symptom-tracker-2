import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isValidEmail, isValidCode } from '@/lib/beta/validation'
import type { BetaSignupRequest, BetaSignupResponse } from '@/lib/beta/types'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Admin email for notifications
const ADMIN_EMAIL = 'steven@spennington.dev'

export async function POST(request: Request): Promise<NextResponse<BetaSignupResponse>> {
  // Check if Resend is configured
  if (!resend) {
    return NextResponse.json(
      { success: false, error: 'Email service not configured' },
      { status: 500 }
    )
  }

  // Parse request body
  let body: BetaSignupRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { email, code } = body

  // Validate email
  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Email is required' },
      { status: 400 }
    )
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { success: false, error: 'Invalid email format' },
      { status: 400 }
    )
  }

  // Validate code
  if (!code) {
    return NextResponse.json(
      { success: false, error: 'Code is required' },
      { status: 400 }
    )
  }

  if (!isValidCode(code)) {
    return NextResponse.json(
      { success: false, error: 'Invalid code format' },
      { status: 400 }
    )
  }

  try {
    // Send emails in parallel
    const [userEmailResult, adminEmailResult] = await Promise.allSettled([
      // User unlock code email
      resend.emails.send({
        from: 'Pocket Symptom Tracker <onboarding@resend.dev>',
        to: email.trim().toLowerCase(),
        subject: 'Your Pocket Symptom Tracker Beta Access Code',
        text: `Welcome to Pocket Symptom Tracker Beta!

Your unlock code is: ${code.toUpperCase()}

Enter this code at the verification page to access the app.

Questions? Reply to this email.`
      }),

      // Admin notification email
      resend.emails.send({
        from: 'Pocket Symptom Tracker <onboarding@resend.dev>',
        to: ADMIN_EMAIL,
        subject: `New Beta Signup: ${email}`,
        text: `New beta signup request:

Email: ${email}
Code: ${code.toUpperCase()}
Time: ${new Date().toISOString()}`
      })
    ])

    // Check if user email was sent successfully
    if (userEmailResult.status === 'rejected') {
      console.error('Failed to send user email:', userEmailResult.reason)
      return NextResponse.json(
        { success: false, error: 'Failed to send email. Please try again.' },
        { status: 500 }
      )
    }

    // Log admin email failure but don't fail the request
    if (adminEmailResult.status === 'rejected') {
      console.error('Failed to send admin notification:', adminEmailResult.reason)
    }

    return NextResponse.json({
      success: true,
      message: 'Unlock code sent to your email'
    })
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email. Please try again.' },
      { status: 500 }
    )
  }
}
