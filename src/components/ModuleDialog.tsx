import { useState, type FormEvent } from 'react';
import { validateModule } from '../lib/validation';
import type { Module, ModuleDraft } from '../types';
import { Field } from './Field';
import { Modal } from './Modal';

interface ModuleDialogProps {
  /** The module being renamed, or null when adding. */
  module: Module | null;
  onSave: (draft: ModuleDraft) => void;
  onClose: () => void;
}

export function ModuleDialog({ module, onSave, onClose }: ModuleDialogProps) {
  const [name, setName] = useState(module?.name ?? '');
  const [code, setCode] = useState(module?.code ?? '');
  const [errors, setErrors] = useState<ReturnType<typeof validateModule>>({});

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateModule({ name, code });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({ name: name.trim(), code: code.trim() });
    onClose();
  };

  return (
    <Modal title={module ? 'Rename module' : 'Add module'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        <Field label="Module name" error={errors.name}>
          {(control) => (
            <input {...control} className="input" value={name} onChange={(e) => setName(e.target.value)} />
          )}
        </Field>
        <Field label="Short code for the tab (optional)" error={errors.code}>
          {(control) => (
            <input {...control} className="input" value={code} onChange={(e) => setCode(e.target.value)} />
          )}
        </Field>
        <div className="dialog-actions">
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit">
            {module ? 'Save changes' : 'Add module'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
