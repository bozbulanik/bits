const renderDefaultValueInput = (propType: BitTypePropertyDefinitionType) => {
    switch (propType) {
      // case 'bit':
      //   return (
      //     <div className="flex flex-col gap-1">
      //       <p className="text-text-muted text-sm font-semibold">Default Value</p>
      //       <Combobox
      //         searchable
      //         placeholder="Select a bit"
      //         selectedValues={currentPropDV as string}
      //         options={bitOptions}
      //         onChange={(e) => setCurrentPropDV(e)}
      //       />
      //     </div>
      //   )
      case 'text':
      case 'document':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>

            <textarea
              value={currentPropDV as string}
              onChange={(e) => setCurrentPropDV(e.target.value)}
              placeholder="Enter default value..."
              className="p-1 resize-none h-48 text-sm focus:outline-none bg-input-bg dark:bg-input-bg-dark rounded-md border border-input-border dark:border-input-border-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark hover:border-input-border-hover dark:hover:border-input-border-hover-dark placeholder-text-muted"
            />
          </div>
        )
      case 'number':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <NumberInput className="justify-between" placeholderValue={1} value={currentPropDV as number} onChange={(e) => setCurrentPropDV(e)} />
          </div>
        )
      case 'select':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              maxH={64}
              searchable
              placeholder="Select default option"
              options={selectOptions}
              selectedValues={currentPropDV as string}
              onChange={(e) => setCurrentPropDV(e)}
            />
          </div>
        )
      case 'multiselect':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              maxH={64}
              multiSelect
              searchable
              placeholder="Select default option"
              options={selectOptions}
              selectedValues={currentPropDV as string}
              onChange={(e) => setCurrentPropDV(e)}
            />
          </div>
        )
      case 'date':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <div>
              <DateInput
                ghost
                className=""
                placeholder="Set date"
                setCurrentDisplayDate={(e) => setCurrentPropDV(e.toISOString())}
                horizontalAlign="left"
              />
            </div>
          </div>
        )
      case 'file':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <div
              onMouseEnter={() => setFileSelectorHovered(true)}
              onMouseLeave={() => setFileSelectorHovered(false)}
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full min-h-32 max-h-96 cursor-pointer text-text-muted bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark border border-dashed border-input-border dark:border-input-border-dark rounded-md flex items-center justify-center"
            >
              {currentPropDV != '' ? (
                <div className="p-2 w-full h-full flex flex-col items-center justify-center ">
                  <p>File selected</p>
                  <p className="w-full truncate text-sm">{currentPropDV as string}</p>
                </div>
              ) : (
                <File size={32} strokeWidth={1} />
              )}
              {fileSelectorHovered && (
                <div
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-md  ${
                    currentPropDV == ''
                      ? 'bg-button-bg dark:bg-button-bg-dark opacity-100 text-text-muted'
                      : 'bg-button-bg dark:bg-button-bg-dark opacity-75 text-text dark:text-text-dark'
                  }`}
                >
                  {currentPropDV == '' ? (
                    <div className="w-full h-full text-center flex flex-col gap-1 items-center justify-center">
                      <FilePlus size={32} strokeWidth={1} />

                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    </div>
                  ) : (
                    <div onClick={() => setCurrentPropDV('')} className="text-red-500 w-full h-full flex items-center justify-center">
                      <Trash size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      case 'checkbox':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <div className="flex items-center gap-2 ">
              <Checkbox checked={currentPropDV as boolean} onChange={(e) => setCurrentPropDV(e)} />{' '}
              <p className="text-sm">{currentPropDV == true ? 'Checked' : 'Unchecked'}</p>
            </div>
          </div>
        )
      case 'url':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="https://www.example.com" />
          </div>
        )
      case 'email':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="example@mail.com" />
          </div>
        )
      case 'phone':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="5555-55-55" />
          </div>
        )
      case 'image':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>

            <div
              onMouseEnter={() => setImageSelectorHovered(true)}
              onMouseLeave={() => setImageSelectorHovered(false)}
              onClick={() => imageInputRef.current?.click()}
              className="relative w-full min-h-32 max-h-96 cursor-pointer text-text-muted bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark border border-dashed border-input-border dark:border-input-border-dark rounded-md flex items-center justify-center"
            >
              {currentPropDV != '' ? (
                <img className="w-full h-full rounded-lg p-1 object-cover" src={currentPropDV as string} />
              ) : (
                <Image size={32} strokeWidth={1} />
              )}

              {imageSelectorHovered && (
                <div
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-md  ${
                    currentPropDV == ''
                      ? 'bg-button-bg dark:bg-button-bg-dark opacity-100 text-text-muted'
                      : 'bg-button-bg dark:bg-button-bg-dark opacity-75 text-text dark:text-text-dark'
                  }`}
                >
                  {currentPropDV == '' ? (
                    <div className="w-full h-full text-center flex flex-col gap-1 items-center justify-center">
                      <ImagePlus size={32} strokeWidth={1} />

                      <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={handleImageChange} />
                    </div>
                  ) : (
                    <div onClick={() => setCurrentPropDV('')} className="text-red-500 w-full h-full flex items-center justify-center">
                      <Trash size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      case 'currency':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              maxH={64}
              placeholder="Select a currency"
              searchable
              selectedValues={currentPropDV as string}
              options={currencyOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>
            <Input placeholder="Enter custom currency..." value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} />
          </div>
        )
      case 'location':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            {isOnline ? (
              <div className="z-10 w-full h-64 flex items-center justify-center rounded-xl ">
                <MapContainer
                  zoomControl={false}
                  worldCopyJump={false}
                  maxBoundsViscosity={1.0}
                  maxBounds={[
                    [-90, -180],
                    [90, 180]
                  ]}
                  center={[47.60885308607487, 97.55267161699676]}
                  zoom={5}
                  style={{
                    border: '1px solid rgb(83 83 83)',
                    borderRadius: '8px',
                    height: '100%',
                    width: '100%'
                  }}
                >
                  <TileLayer
                    url={`${
                      settings.theme.mode === 'light'
                        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    }`}
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    subdomains={'abcd'}
                  />
                  <LocationClickHandler onClick={setCurrentPropDV} />

                  {currentPropDV && (
                    <Marker position={currentPropDV as [number, number]}>
                      <Popup>
                        <div>
                          <strong>Selected location</strong>
                          <br />
                          {locationName || 'Loading location name...'}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            ) : (
              <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="Enter location" />
            )}
          </div>
        )
      case 'percentage':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <NumberInput className="justify-between" placeholderValue={100} value={currentPropDV as number} onChange={(e) => setCurrentPropDV(e)} />
          </div>
        )
      case 'barcode':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="Enter barcode number" />
          </div>
        )
      case 'planguage':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              maxH={64}
              placeholder="Select a programming language"
              searchable
              selectedValues={currentPropDV as string}
              options={programmingLanguageOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>
            <Input
              placeholder="Enter custom programming language..."
              value={currentPropDV as string}
              onChange={(e) => setCurrentPropDV(e.target.value)}
            />
          </div>
        )
      case 'country':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              maxH={64}
              placeholder="Select a country"
              searchable
              selectedValues={currentPropDV as string}
              options={countryOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>

            <Input placeholder="Enter custom country..." value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} />
          </div>
        )
      case 'language':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              maxH={64}
              placeholder="Select a language"
              searchable
              selectedValues={currentPropDV as string}
              options={languageOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>
            <Input placeholder="Enter custom language..." value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} />
          </div>
        )
      case 'audio':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <div
              onMouseEnter={() => setAudioFileSelectorHovered(true)}
              onMouseLeave={() => setAudioFileSelectorHovered(false)}
              onClick={() => audioFileInputRef.current?.click()}
              className="relative w-full min-h-32 max-h-96 cursor-pointer text-text-muted bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark border border-dashed border-input-border dark:border-input-border-dark rounded-md flex items-center justify-center"
            >
              {currentPropDV != '' ? (
                <div className="p-2 w-full h-full flex flex-col items-center justify-center ">
                  <p>File selected</p>
                  <p className="w-full truncate text-sm">{currentPropDV as string}</p>
                </div>
              ) : (
                <FileAudio size={32} strokeWidth={1} />
              )}
              {audioFileSelectorHovered && (
                <div
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-md  ${
                    currentPropDV == ''
                      ? 'bg-button-bg dark:bg-button-bg-dark opacity-100 text-text-muted'
                      : 'bg-button-bg dark:bg-button-bg-dark opacity-75 text-text dark:text-text-dark'
                  }`}
                >
                  {currentPropDV == '' ? (
                    <div className="w-full h-full text-center flex flex-col gap-1 items-center justify-center">
                      <Plus size={32} strokeWidth={1} />

                      <input type="file" accept="audio/*" ref={audioFileInputRef} className="hidden" onChange={handleAudioFileChange} />
                    </div>
                  ) : (
                    <div onClick={() => setCurrentPropDV('')} className="text-red-500 w-full h-full flex items-center justify-center">
                      <Trash size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      case 'color':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>

            <div className="flex items-center gap-2">
              <Input
                className="flex-1"
                value={currentPropDV as string}
                onChange={(e) => setCurrentPropDV(e.target.value)}
                placeholder="Enter color code"
              />
              <div
                className="w-7 h-7 border rounded-md border-input-border dark:border-input-border-dark"
                style={{ backgroundColor: `${currentPropDV}` }}
              ></div>
            </div>
            <p className="text-sm text-text-muted">HEX, RGBA, HTML color names are accepted</p>
          </div>
        )
      case 'rating':
      case 'range':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <NumberInput
              className="justify-between"
              min={(currentPropOptions[0] as number) || 0}
              max={(currentPropOptions[1] as number) || 5}
              step={(currentPropOptions[2] as number) || 1}
              placeholderValue={0}
              value={(currentPropDV as number) || 0}
              onChange={(e) => setCurrentPropDV(e)}
            />
          </div>
        )
      case 'timezone':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              maxH={64}
              placeholder="Select a time-zone"
              searchable
              selectedValues={currentPropDV as string}
              options={timezoneOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
          </div>
        )
      case 'measurement':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              maxH={64}
              placeholder="Select a measurement unit"
              searchable
              selectedValues={currentPropDV as string}
              options={measurementOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>
            <Input
              placeholder="Enter custom measurement unit..."
              value={currentPropDV as string}
              onChange={(e) => setCurrentPropDV(e.target.value)}
            />
          </div>
        )
      case 'time':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <div>
              <TimeInput
                twelveHours={false}
                includeSeconds={false}
                ghost
                className=""
                placeholder="Set time"
                setCurrentDisplayTime={(e) => setCurrentPropDV(e.toISOString())}
                horizontalAlign="left"
              />
            </div>
          </div>
        )
      case 'datetime':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <DateTimeComponent handlePropDV={setCurrentPropDV} />
          </div>
        )
    }
}
  


function LocationClickHandler({ onClick }: { onClick: (loc: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      const latlng = [e.latlng.lat, ((((e.latlng.lng + 180) % 360) + 360) % 360) - 180] as [number, number]
      onClick(latlng)
    }
  })

  return null
}

const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0]
    if (image && image.type.startsWith('image/')) {
      window.ipcRenderer.send('useImage', image.path)
    }
    window.ipcRenderer.on('imageSet', (_event, customPath) => {
      setCurrentPropDV(customPath)
    })
    setImageSelectorHovered(false)
  }
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [imageSelectorHovered, setImageSelectorHovered] = useState<boolean>(false)

  //FILE
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    window.ipcRenderer.send('useFile', file.path)
    window.ipcRenderer.on('fileSet', (_event, customPath) => {
      setCurrentPropDV(customPath)
    })
  }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileSelectorHovered, setFileSelectorHovered] = useState<boolean>(false)

  // SELECT
  const selectOptions =
    Array.isArray(currentPropOptions) && currentPropOptions.every((item) => typeof item === 'string')
      ? [
          {
            options: currentPropOptions.map((opt) => ({
              value: opt,
              label: opt
            }))
          }
        ]
      : []
  // PLANG

  //AUDIO
  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    window.ipcRenderer.send('useFile', file.path)
    window.ipcRenderer.on('fileSet', (_event, customPath) => {
      setCurrentPropDV(customPath)
    })
  }
  const audioFileInputRef = useRef<HTMLInputElement>(null)
  const [audioFileSelectorHovered, setAudioFileSelectorHovered] = useState<boolean>(false)