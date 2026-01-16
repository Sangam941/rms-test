import { Menu } from 'lucide-react'
import React, { useState } from 'react'
import AdminSidebar from './AdminSidebar'

const ToggleSideBar:React.FC = () => {

    const [sidebarOpen, setSidebarOpen] = useState(false)
    
    return (
        <button
            onClick={() => {
                setSidebarOpen(!sidebarOpen)
            }}
            className="lg:hidden"
        >
            <Menu className="w-6 h-6" />
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </button>
    )
}

export default ToggleSideBar