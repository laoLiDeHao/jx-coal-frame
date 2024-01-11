'use client'
import React, { useEffect, useReducer, useRef } from 'react'
import "cesium/Build/Cesium/Widgets/widgets.css";
import CesiumController from '@/utils/cesium/initCesium';
const page = () => {
    const viewerRef = useRef(null)
    useEffect(()=>{
        const viewer = new CesiumController('cesiumContainer')
        viewerRef.current = viewer
    })
  return (
    <div
    //  className='w-full h-full' 
       className="container-integrate w-full h-full" >
        <div id="cesiumContainer" className='w-full h-full'>
            {/* <h1>cesiumContainer</h1> */}
        </div>
    </div>
  )
}

export default page