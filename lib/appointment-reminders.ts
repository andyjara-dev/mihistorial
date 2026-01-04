import { prisma } from './prisma'
import { sendAppointmentReminderEmail } from './email-templates/appointment-reminder'

export interface ReminderStats {
  reminder1Sent: number
  reminder2Sent: number
  errors: number
}

/**
 * Verifica y envía recordatorios de citas médicas
 * - Reminder 1: 3 días antes de la cita
 * - Reminder 2: 1 día antes de la cita
 */
export async function checkAndSendReminders(): Promise<ReminderStats> {
  const stats: ReminderStats = {
    reminder1Sent: 0,
    reminder2Sent: 0,
    errors: 0,
  }

  const now = new Date()

  console.log(`🔔 Checking appointment reminders at ${now.toISOString()}`)

  // ===== REMINDER 1: 3 días antes =====
  const threeDaysFromNow = new Date(now)
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  threeDaysFromNow.setHours(0, 0, 0, 0)

  const threeDaysEnd = new Date(threeDaysFromNow)
  threeDaysEnd.setHours(23, 59, 59, 999)

  // Buscar citas para reminder 1 (3 días antes, no enviado)
  const appointments3Days = await prisma.appointment.findMany({
    where: {
      status: 'scheduled',
      sendReminders: true,
      reminder1Sent: false,
      appointmentDate: {
        gte: threeDaysFromNow,
        lte: threeDaysEnd,
      },
    },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  console.log(`Found ${appointments3Days.length} appointments for 3-day reminder`)

  // Enviar reminder 1
  for (const appointment of appointments3Days) {
    try {
      const result = await sendAppointmentReminderEmail({
        to: appointment.user.email,
        userName: `${appointment.user.firstName} ${appointment.user.lastName}`,
        doctorName: appointment.doctorName,
        specialty: appointment.specialty,
        appointmentDate: appointment.appointmentDate,
        location: appointment.location || 'No especificada',
        daysUntil: 3,
      })

      if (result.success) {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            reminder1Sent: true,
            reminder1SentAt: now,
          },
        })

        stats.reminder1Sent++
        console.log(`✅ Reminder 1 sent for appointment ${appointment.id} (${appointment.doctorName})`)
      } else {
        stats.errors++
        console.error(`❌ Failed to send reminder 1 for ${appointment.id}: ${result.error}`)
      }
    } catch (error) {
      console.error(`❌ Error sending reminder 1 for appointment ${appointment.id}:`, error)
      stats.errors++
    }
  }

  // ===== REMINDER 2: 1 día antes =====
  const oneDayFromNow = new Date(now)
  oneDayFromNow.setDate(oneDayFromNow.getDate() + 1)
  oneDayFromNow.setHours(0, 0, 0, 0)

  const oneDayEnd = new Date(oneDayFromNow)
  oneDayEnd.setHours(23, 59, 59, 999)

  // Buscar citas para reminder 2 (1 día antes, no enviado)
  const appointments1Day = await prisma.appointment.findMany({
    where: {
      status: 'scheduled',
      sendReminders: true,
      reminder2Sent: false,
      appointmentDate: {
        gte: oneDayFromNow,
        lte: oneDayEnd,
      },
    },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  console.log(`Found ${appointments1Day.length} appointments for 1-day reminder`)

  // Enviar reminder 2
  for (const appointment of appointments1Day) {
    try {
      const result = await sendAppointmentReminderEmail({
        to: appointment.user.email,
        userName: `${appointment.user.firstName} ${appointment.user.lastName}`,
        doctorName: appointment.doctorName,
        specialty: appointment.specialty,
        appointmentDate: appointment.appointmentDate,
        location: appointment.location || 'No especificada',
        daysUntil: 1,
      })

      if (result.success) {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            reminder2Sent: true,
            reminder2SentAt: now,
          },
        })

        stats.reminder2Sent++
        console.log(`✅ Reminder 2 sent for appointment ${appointment.id} (${appointment.doctorName})`)
      } else {
        stats.errors++
        console.error(`❌ Failed to send reminder 2 for ${appointment.id}: ${result.error}`)
      }
    } catch (error) {
      console.error(`❌ Error sending reminder 2 for appointment ${appointment.id}:`, error)
      stats.errors++
    }
  }

  console.log(`📊 Reminder stats:`, stats)
  return stats
}
