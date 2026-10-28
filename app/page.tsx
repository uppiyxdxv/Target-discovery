'use client'

import { ChangeEvent, DragEvent, useState } from 'react'
import { CloudUpload, File, FileText, Image, X } from 'lucide-react'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)

  function addFiles(nextFiles: FileList | File[]) {
    const accepted = Array.from(nextFiles).filter((file) => file.size <= 10 * 1024 * 1024)
    setFiles((current) => [...current, ...accepted.filter((file) => !current.some((item) => item.name === file.name && item.size === file.size))])
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files)
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    addFiles(event.dataTransfer.files)
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="upload-card" aria-labelledby="page-title">
        <div className="brand-mark"><CloudUpload size={18} /></div>
        <p className="eyebrow">Simple file workspace</p>
        <h1 id="page-title">Upload your files</h1>
        <p className="intro">Drop documents, images, and other files here. Files stay ready for your next step.</p>
        <label className={`drop-zone ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
          <input type="file" multiple onChange={handleInput} />
          <span className="upload-icon"><CloudUpload size={25} /></span>
          <strong>Drag and drop files here</strong>
          <span>or <b>browse from your device</b></span>
          <small>Maximum file size: 10 MB per file</small>
        </label>
        {files.length > 0 && <div className="file-list" aria-live="polite"><div className="list-heading"><span>Selected files</span><span>{files.length} {files.length === 1 ? 'file' : 'files'}</span></div>{files.map((file, index) => <div className="file-row" key={`${file.name}-${file.size}-${index}`}><span className="file-type">{file.type.startsWith('image/') ? <Image size={17} /> : file.type.includes('pdf') ? <FileText size={17} /> : <File size={17} />}</span><span className="file-info"><strong>{file.name}</strong><small>{formatSize(file.size)}</small></span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X size={16} /></button></div>)}</div>}
        <p className="privacy-note">Files are selected locally in your browser. No upload happens until you connect a storage service.</p>
      </section>
    </main>
  )
}
