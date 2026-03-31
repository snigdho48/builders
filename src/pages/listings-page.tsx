import { useEffect, useMemo, useState } from "react"

import { PropertyCard } from "@/components/property-card"
import { getProperties } from "@/services/api"
import type { Property } from "@/types/domain"

export function ListingsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    getProperties().then(setProperties)
  }, [])

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesQuery =
        property.title.toLowerCase().includes(query.toLowerCase()) ||
        property.location_name.toLowerCase().includes(query.toLowerCase())
      const matchesType = typeFilter === "all" || property.property_type === typeFilter
      return matchesQuery && matchesType
    })
  }, [properties, query, typeFilter])

  return (
    <main className="bg-slate-950 px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Properties</p>
            <h1 className="text-3xl font-semibold">Explore all listings</h1>
          </div>
          <div className="ml-auto flex flex-wrap gap-3">
            <input
              className="template-input min-w-56"
              placeholder="Search by title or location"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              className="template-input"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">All types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </main>
  )
}
