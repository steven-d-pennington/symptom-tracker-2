import { db, FoodEvent, Food } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type PortionSize = 'small' | 'medium' | 'large'

/**
 * Log a meal with multiple foods
 */
export async function logMeal(data: {
  foodIds: string[]
  mealType: MealType
  portionSizes: Record<string, PortionSize>
  timestamp?: number
  notes?: string
  photoIds?: string[]
}): Promise<FoodEvent> {
  const now = getCurrentTimestamp()
  const timestamp = data.timestamp || now

  // Validate
  if (!data.foodIds || data.foodIds.length === 0) {
    throw new Error('At least one food must be selected')
  }

  // Ensure all foods have portion sizes
  for (const foodId of data.foodIds) {
    if (!data.portionSizes[foodId]) {
      throw new Error(`Portion size missing for food: ${foodId}`)
    }
  }

  const foodEvent: FoodEvent = {
    guid: generateGUID(),
    mealId: generateGUID(), // Each log creates a unique meal
    foodIds: data.foodIds,
    timestamp,
    timezoneOffset: new Date().getTimezoneOffset(),
    mealType: data.mealType,
    portionSizes: data.portionSizes,
    notes: data.notes,
    photoIds: data.photoIds,
    createdAt: now,
  }

  await db.foodEvents.add(foodEvent)
  console.log('Meal logged:', foodEvent.guid)
  return foodEvent
}

/**
 * Get all food events
 */
export async function getFoodEvents(): Promise<FoodEvent[]> {
  return await db.foodEvents.orderBy('timestamp').reverse().toArray()
}

/**
 * Get food events within a date range
 */
export async function getFoodEventsInRange(
  startDate: number,
  endDate: number
): Promise<FoodEvent[]> {
  return await db.foodEvents
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .reverse()
    .sortBy('timestamp')
}

/**
 * Get food events by meal type
 */
export async function getFoodEventsByMealType(mealType: MealType): Promise<FoodEvent[]> {
  return await db.foodEvents
    .where('mealType')
    .equals(mealType)
    .reverse()
    .sortBy('timestamp')
}

/**
 * Get a single food event by ID
 */
export async function getFoodEventById(guid: string): Promise<FoodEvent | undefined> {
  return await db.foodEvents.where('guid').equals(guid).first()
}

/**
 * Update a food event
 */
export async function updateFoodEvent(
  guid: string,
  updates: Partial<Pick<FoodEvent, 'foodIds' | 'mealType' | 'portionSizes' | 'notes' | 'timestamp'>>
): Promise<void> {
  const existing = await getFoodEventById(guid)
  if (!existing) {
    throw new Error('Food event not found')
  }

  // Validate portion sizes if foodIds are updated
  if (updates.foodIds && updates.portionSizes) {
    for (const foodId of updates.foodIds) {
      if (!updates.portionSizes[foodId]) {
        throw new Error(`Portion size missing for food: ${foodId}`)
      }
    }
  }

  await db.foodEvents.where('guid').equals(guid).modify(updates)
}

/**
 * Delete a food event
 */
export async function deleteFoodEvent(guid: string): Promise<void> {
  await db.foodEvents.where('guid').equals(guid).delete()
}

/**
 * Get active foods from the database
 */
export async function getActiveFoods(): Promise<Food[]> {
  return await db.foods.filter((f) => f.isActive === true).toArray()
}

/**
 * Get foods by category
 */
export async function getFoodsByCategory(): Promise<Record<string, Food[]>> {
  const foods = await getActiveFoods()
  return foods.reduce(
    (acc, food) => {
      if (!acc[food.category]) {
        acc[food.category] = []
      }
      acc[food.category].push(food)
      return acc
    },
    {} as Record<string, Food[]>
  )
}

/**
 * Get recent meals (last N)
 */
export async function getRecentMeals(limit: number = 10): Promise<FoodEvent[]> {
  return await db.foodEvents.orderBy('timestamp').reverse().limit(limit).toArray()
}

/**
 * Get today's meals
 */
export async function getTodaysMeals(): Promise<FoodEvent[]> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000

  return await getFoodEventsInRange(startOfDay, endOfDay)
}

/**
 * Get meal statistics for a date range
 */
export async function getMealStats(startDate: number, endDate: number): Promise<{
  totalMeals: number
  mealsByType: Record<MealType, number>
  mostCommonFoods: Array<{ foodId: string; count: number }>
}> {
  const events = await getFoodEventsInRange(startDate, endDate)

  const mealsByType: Record<MealType, number> = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  }

  const foodCounts: Record<string, number> = {}

  events.forEach((event) => {
    mealsByType[event.mealType]++
    event.foodIds.forEach((foodId) => {
      foodCounts[foodId] = (foodCounts[foodId] || 0) + 1
    })
  })

  const mostCommonFoods = Object.entries(foodCounts)
    .map(([foodId, count]) => ({ foodId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    totalMeals: events.length,
    mealsByType,
    mostCommonFoods,
  }
}
