import { Routes, Route } from 'react-router-dom'
import ConfigurationUser from './ConfigurationUser'

const ConfigurationWizard = () => {
  return (
    <Routes>
      <Route path="/user" element={<ConfigurationUser />} />
    </Routes>
  )
}

export default ConfigurationWizard
