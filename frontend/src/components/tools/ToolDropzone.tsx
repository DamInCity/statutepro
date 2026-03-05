'use client';

import { useCallback, useState, type DragEvent, type ChangeEvent } from 'react';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import styles from './Tools.module.css';

interface ToolDropzoneProps {
  accept: string;
  multiple?: boolean;
  files: File[];
  onFiles: (files: File[]) => void;
  hint?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ToolDropzone({
  accept,
  multiple = false,
  files,
  onFiles,
  hint,
}: ToolDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const arr = Array.from(incoming);
      onFiles(multiple ? [...files, ...arr] : [arr[0]]);
    },
    [files, multiple, onFiles],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const removeFile = (idx: number) => {
    onFiles(files.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragover : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="File upload area"
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className={styles.dropzoneInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)}
          aria-label="Choose file"
        />
        <div className={styles.dropzoneIcon}>
          <FiUploadCloud size={32} />
        </div>
        <p className={styles.dropzoneTitle}>
          {multiple ? 'Drop files here or click to browse' : 'Drop a file here or click to browse'}
        </p>
        <p className={styles.dropzoneHint}>
          {hint ?? accept.replace(/\./g, '').toUpperCase()}
        </p>
      </div>

      {files.length > 0 && (
        <ul className={styles.fileList} role="list">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className={styles.fileItem}>
              <FiFile size={15} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              <span className={styles.fileName} title={f.name}>{f.name}</span>
              <span className={styles.fileSize}>{formatBytes(f.size)}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeFile(i)}
                aria-label={`Remove ${f.name}`}
              >
                <FiX size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
