'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { courses, CATEGORIES } from '@/data/courses'
import { CourseCard } from '@/components/course-card'
import { cn } from '@/lib/utils'

type SortOption = 'popular' | 'rating' | 'newest'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Más populares' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'newest', label: 'Más nuevos' },
]

export function CourseCatalog() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [sort, setSort] = useState<SortOption>('popular')

  const filtered = useMemo(() => {
    let list = [...courses]

    // Filter by category
    if (activeCategory !== 'Todos') {
      list = list.filter((c) => c.category === activeCategory)
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sort === 'popular') list.sort((a, b) => b.students - a.students)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    if (sort === 'newest') list.sort((a, b) => Number(b.badge === 'Nuevo') - Number(a.badge === 'Nuevo'))

    return list
  }, [search, activeCategory, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          Catálogo
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-balance mb-2">
          Todos los{' '}
          <span className="neon-text">cursos</span>
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {courses.length} cursos de formación ciudadana. Aprende a tu ritmo, sin registro.
        </p>
      </div>

      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por título, categoría o instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="py-2.5 px-3 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              activeCategory === cat
                ? 'bg-primary text-primary-foreground glow-primary'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No encontramos cursos</h3>
          <p className="text-muted-foreground text-sm">Intenta con otros términos o cambia la categoría.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('Todos') }}
            className="text-sm text-primary hover:opacity-80 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {filtered.length} {filtered.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
