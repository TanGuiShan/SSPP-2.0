// hooks/useForm.js
// Small controlled-form helper: holds field values and gives back a
// handleChange(field) function so inputs can do onChange={handleChange("x")}.

import { useState } from "react";

export function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setValues((v) => ({ ...v, [field]: value }));
  };

  const setField = (field, value) => setValues((v) => ({ ...v, [field]: value }));

  const reset = () => setValues(initialValues);

  return { values, setValues, handleChange, setField, reset };
}

export default useForm;