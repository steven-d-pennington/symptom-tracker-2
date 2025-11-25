import { db, Food } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

export type PreparationMethod = 'raw' | 'cooked' | 'fried' | 'baked'

export const ALLERGEN_TAGS = [
  'dairy',
  'gluten',
  'nuts',
  'eggs',
  'soy',
  'shellfish',
  'fish',
  'wheat',
  'peanuts',
  'tree nuts',
  'sesame',
  'sulfites',
  'nightshades',
  'fodmap',
] as const

export type AllergenTag = (typeof ALLERGEN_TAGS)[number]

export const FOOD_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Grains',
  'Proteins',
  'Dairy',
  'Beverages',
  'Snacks',
  'Condiments',
  'Desserts',
  'Other',
] as const

export type FoodCategory = (typeof FOOD_CATEGORIES)[number]

export interface CreateFoodInput {
  name: string
  category: string
  allergenTags: string[]
  preparationMethod?: PreparationMethod
}

export interface UpdateFoodInput {
  name?: string
  category?: string
  allergenTags?: string[]
  preparationMethod?: PreparationMethod
}

/**
 * Get all foods
 */
export async function getAllFoods(): Promise<Food[]> {
  return await db.foods.orderBy('name').toArray()
}

/**
 * Get all active foods
 */
export async function getActiveFoods(): Promise<Food[]> {
  return await db.foods.filter((f) => f.isActive).toArray()
}

/**
 * Get a food by ID
 */
export async function getFoodById(guid: string): Promise<Food | undefined> {
  return await db.foods.where('guid').equals(guid).first()
}

/**
 * Create a custom food
 */
export async function createFood(input: CreateFoodInput): Promise<Food> {
  const now = getCurrentTimestamp()

  // Validate name
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('Food name is required')
  }

  // Check for duplicate name
  const existing = await db.foods
    .filter((f) => f.name.toLowerCase() === input.name.toLowerCase())
    .first()

  if (existing) {
    throw new Error('A food with this name already exists')
  }

  const food: Food = {
    guid: generateGUID(),
    name: input.name.trim(),
    category: input.category || 'Other',
    allergenTags: input.allergenTags || [],
    preparationMethod: input.preparationMethod,
    isActive: true,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  }

  await db.foods.add(food)
  return food
}

/**
 * Update a food
 */
export async function updateFood(guid: string, updates: UpdateFoodInput): Promise<Food> {
  const existing = await getFoodById(guid)
  if (!existing) {
    throw new Error('Food not found')
  }

  // Validate name if being updated
  if (updates.name !== undefined) {
    if (!updates.name || updates.name.trim().length === 0) {
      throw new Error('Food name is required')
    }

    // Check for duplicate name (excluding this food)
    const duplicate = await db.foods
      .filter((f) => f.name.toLowerCase() === updates.name!.toLowerCase() && f.guid !== guid)
      .first()

    if (duplicate) {
      throw new Error('A food with this name already exists')
    }
  }

  const updatedFood: Food = {
    ...existing,
    name: updates.name?.trim() ?? existing.name,
    category: updates.category ?? existing.category,
    allergenTags: updates.allergenTags ?? existing.allergenTags,
    preparationMethod: updates.preparationMethod ?? existing.preparationMethod,
    updatedAt: getCurrentTimestamp(),
  }

  await db.foods.where('guid').equals(guid).modify({
    name: updatedFood.name,
    category: updatedFood.category,
    allergenTags: updatedFood.allergenTags,
    preparationMethod: updatedFood.preparationMethod,
    updatedAt: updatedFood.updatedAt,
  })
  return updatedFood
}

/**
 * Deactivate a food (soft delete)
 */
export async function deactivateFood(guid: string): Promise<void> {
  await db.foods.where('guid').equals(guid).modify({
    isActive: false,
    updatedAt: getCurrentTimestamp(),
  })
}

/**
 * Reactivate a food
 */
export async function reactivateFood(guid: string): Promise<void> {
  await db.foods.where('guid').equals(guid).modify({
    isActive: true,
    updatedAt: getCurrentTimestamp(),
  })
}

/**
 * Delete a food permanently (only for non-default foods)
 */
export async function deleteFood(guid: string): Promise<void> {
  const food = await getFoodById(guid)
  if (!food) {
    throw new Error('Food not found')
  }

  if (food.isDefault) {
    throw new Error('Cannot delete default foods')
  }

  await db.foods.where('guid').equals(guid).delete()
}

/**
 * Search and filter foods
 */
export async function searchFoods(options: {
  query?: string
  categories?: string[]
  allergenTags?: string[]
  includeInactive?: boolean
  sortBy?: 'name' | 'category' | 'frequency'
  sortOrder?: 'asc' | 'desc'
}): Promise<Food[]> {
  let results = await db.foods.toArray()

  // Filter by active status
  if (!options.includeInactive) {
    results = results.filter((f) => f.isActive)
  }

  // Filter by search query
  if (options.query && options.query.trim()) {
    const query = options.query.toLowerCase().trim()
    results = results.filter(
      (f) =>
        f.name.toLowerCase().includes(query) || f.category.toLowerCase().includes(query)
    )
  }

  // Filter by categories
  if (options.categories && options.categories.length > 0) {
    results = results.filter((f) => options.categories!.includes(f.category))
  }

  // Filter by allergen tags
  if (options.allergenTags && options.allergenTags.length > 0) {
    results = results.filter((f) =>
      options.allergenTags!.some((tag) => f.allergenTags.includes(tag))
    )
  }

  // Sort results
  const sortBy = options.sortBy || 'name'
  const sortOrder = options.sortOrder || 'asc'

  if (sortBy === 'frequency') {
    // Get frequency counts from food events
    const foodEvents = await db.foodEvents.toArray()
    const frequencyMap = new Map<string, number>()

    foodEvents.forEach((event) => {
      event.foodIds.forEach((foodId) => {
        frequencyMap.set(foodId, (frequencyMap.get(foodId) || 0) + 1)
      })
    })

    results.sort((a, b) => {
      const aFreq = frequencyMap.get(a.guid) || 0
      const bFreq = frequencyMap.get(b.guid) || 0
      return sortOrder === 'asc' ? aFreq - bFreq : bFreq - aFreq
    })
  } else if (sortBy === 'category') {
    results.sort((a, b) => {
      const comparison = a.category.localeCompare(b.category)
      return sortOrder === 'asc' ? comparison : -comparison
    })
  } else {
    // Sort by name
    results.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name)
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  return results
}

/**
 * Get food usage frequency
 */
export async function getFoodFrequency(): Promise<Map<string, number>> {
  const foodEvents = await db.foodEvents.toArray()
  const frequencyMap = new Map<string, number>()

  foodEvents.forEach((event) => {
    event.foodIds.forEach((foodId) => {
      frequencyMap.set(foodId, (frequencyMap.get(foodId) || 0) + 1)
    })
  })

  return frequencyMap
}

/**
 * Get foods grouped by category
 */
export async function getFoodsByCategory(
  includeInactive = false
): Promise<Record<string, Food[]>> {
  const foods = includeInactive ? await getAllFoods() : await getActiveFoods()

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
