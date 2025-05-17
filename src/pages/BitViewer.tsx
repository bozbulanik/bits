import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useBitsStore } from '../stores/bitsStore'
import { Bit, BitTypePropertyDefinitionType } from '../types/Bit'
import { format } from 'date-fns'
import { getIconComponent } from '../utils/getIcon'

const BitViewer = () => {
  const { id } = useParams<{ id: string }>()
  if (!id) return <div>Invalid bit ID</div>

  const { getBitById } = useBitsStore()
  const bit = getBitById(id)
  useEffect(() => {
    if (id && bit === undefined) {
      const timeout = setTimeout(() => {
        window.ipcRenderer.invoke('closeWindow', 'bitviewer')
      }, 300)

      return () => clearTimeout(timeout)
    }
  }, [id, bit])

  if (!bit) return null

  function renderValueByType(type: BitTypePropertyDefinitionType, value: any) {
    switch (type) {
      case 'text':
      case 'number':
      case 'email':
      case 'phone':
        return <span>{value}</span>

      case 'checkbox':
        return <span>{value ? 'Yes' : 'No'}</span>

      case 'url':
        return (
          <a href={value} target="_blank" className="text-blue-600 underline">
            {value}
          </a>
        )

      case 'date':
        return <span>{new Date(value).toLocaleDateString()}</span>

      case 'select':
        return <span>{value}</span>

      case 'multiselect':
        return (
          <ul className="list-disc list-inside">
            {(value as string[]).map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        )

      case 'file':
      case 'image':
        return (
          <a href={value} target="_blank" className="text-blue-600 underline">
            {value}
          </a>
        )

      default:
        return <span>{String(value)}</span>
    }
  }
  function renderBitData(bit: Bit) {
    const sortedProperties = [...bit.type.properties].sort((a, b) => a.sortId - b.sortId)

    return (
      <div className="flex flex-col text-text-muted">
        {sortedProperties.map((property) => {
          const bitData = bit.data.find((data: any) => data.propertyId === property.id)

          return (
            <div key={property.id} className="text-sm">
              <div className="flex gap-2">
                <strong>{property.name}: </strong>
                {bitData ? (
                  <span className="ml-auto">{renderValueByType(property.type, bitData.value)}</span>
                ) : (
                  <span className="italic text-gray-500">No data</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 p-2">
      <div className="flex gap-2 items-center">
        {(() => {
          const Icon = getIconComponent(bit.type.iconName)
          return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
        })()}
        <p className="font-semibold">{bit.type.name}</p>
      </div>
      <div>{bit.pinned}</div>
      <div className="text-sm flex gap-2 justify-between">
        <p>{format(new Date(bit.createdAt), 'EE, MMM d hh:mm')}</p>
        <p>{format(new Date(bit.updatedAt), 'EE, MMM d hh:mm')}</p>
      </div>
      <div>{renderBitData(bit)}</div>
    </div>
  )
}

export default BitViewer
