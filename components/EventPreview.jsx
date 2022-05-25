import { useState } from 'react'


const statusClasses = {
    "success": ["bg-green-100 border-green-700 text-green-700", "bg-green-700 hover:bg-green-900"],
    "error": ["bg-red-100 border-red-700 text-red-700", "bg-red-700 hover:bg-red-900"],
    "info": ["bg-teal-100 border-teal-700 text-teal-700", "bg-teal-700 hover:bg-teal-900"],
    "warning": ["bg-orange-100 border-orange-700 text-orange-700", "bg-orange-700 hover:bg-orange-900"]
}


export const EventPreview = () => {
  return (
    <div className="md:col-span-2">
      <h2 className="text-2xl font-bold py-4">Preview</h2>

      {/* UNIQUE */}
      <div className="flex gap-2">
        <div className="w-1/3">
          <span className="text-sm">date</span>
          <div className="shadow rounded-md p-2">
            <div className="font-bold">Title</div>
            <div>Location</div>
            <span className="text-xs inline-block px-2 lowercase rounded text-pink-600 bg-pink-200">pink</span>
          </div>
        </div>
      </div>

      {/* REPEAT */}
      <div className="flex gap-2">
        <div className="shadow rounded-md w-1/3 p-2">
          <div className="font-bold">Title</div>
          <div>Location</div>
          <div>Categories</div>
        </div>
        <div className="shadow rounded-md w-1/3 p-2">
          <div className="font-bold">Title</div>
          <div>Location</div>
          <div>Categories</div>
        </div>
        <div className="shadow rounded-md w-1/3 p-2">
          <div className="font-bold">Title</div>
          <div>Location</div>
          <div>Categories</div>
        </div>
      </div>

      {/* RANGE */}
      <div className="shadow rounded-md w-full p-2">
        <div className="font-bold">Title</div>
        <div>Location</div>
        <div>Categories</div>
      </div>

    </div>
  )
}
