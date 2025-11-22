'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const SolarSimulator = dynamic(() => import('./SolarSimulator'), { ssr: false })

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [latitude, setLatitude] = useState(45.0)
  const [longitude, setLongitude] = useState(0.0)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [azimuth, setAzimuth] = useState(180)
  const [elevation, setElevation] = useState(45)
  const [autoTrack, setAutoTrack] = useState(false)
  const [panelTiltX, setPanelTiltX] = useState(0)
  const [panelTiltY, setPanelTiltY] = useState(45)
  const [efficiency, setEfficiency] = useState(0)

  useEffect(() => {
    setMounted(true)
    const now = new Date()
    setDate(now.toISOString().split('T')[0])
    setTime(now.toTimeString().slice(0, 5))
  }, [])

  useEffect(() => {
    if (date && time) {
      calculateSunPosition()
    }
  }, [date, time, latitude, longitude])

  useEffect(() => {
    if (autoTrack) {
      setPanelTiltX(azimuth)
      setPanelTiltY(elevation)
    }
  }, [autoTrack, azimuth, elevation])

  useEffect(() => {
    calculateEfficiency()
  }, [panelTiltX, panelTiltY, azimuth, elevation])

  const calculateSunPosition = () => {
    if (!date || !time) return

    const dateTime = new Date(`${date}T${time}:00`)
    const dayOfYear = Math.floor((dateTime.getTime() - new Date(dateTime.getFullYear(), 0, 0).getTime()) / 86400000)
    const hour = dateTime.getHours() + dateTime.getMinutes() / 60

    // Déclinaison solaire
    const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180)

    // Angle horaire
    const hourAngle = 15 * (hour - 12) + longitude

    // Élévation solaire
    const latRad = latitude * Math.PI / 180
    const declRad = declination * Math.PI / 180
    const hourAngleRad = hourAngle * Math.PI / 180

    const elevationRad = Math.asin(
      Math.sin(latRad) * Math.sin(declRad) +
      Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngleRad)
    )
    const elevationDeg = elevationRad * 180 / Math.PI

    // Azimuth solaire
    const azimuthRad = Math.acos(
      (Math.sin(declRad) - Math.sin(latRad) * Math.sin(elevationRad)) /
      (Math.cos(latRad) * Math.cos(elevationRad))
    )
    let azimuthDeg = azimuthRad * 180 / Math.PI

    if (hour > 12) {
      azimuthDeg = 360 - azimuthDeg
    }

    setAzimuth(Math.max(0, Math.min(360, azimuthDeg)))
    setElevation(Math.max(0, Math.min(90, elevationDeg)))
  }

  const calculateEfficiency = () => {
    const azimuthDiff = Math.abs(panelTiltX - azimuth)
    const elevationDiff = Math.abs(panelTiltY - elevation)

    const azimuthFactor = Math.cos(azimuthDiff * Math.PI / 180)
    const elevationFactor = Math.cos(elevationDiff * Math.PI / 180)

    const eff = Math.max(0, Math.min(100, azimuthFactor * elevationFactor * 100))
    setEfficiency(eff)
  }

  if (!mounted) return null

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '25px',
        borderRadius: '12px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '380px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        <h1 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 'bold', color: '#ffa500' }}>
          ☀️ Simulateur Suivi Solaire Bi-Axial
        </h1>

        <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255, 165, 0, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 165, 0, 0.3)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#ffa500' }}>📍 Localisation</h3>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
            Latitude (°):
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              step="0.1"
              style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #444', background: '#1a1a1a', color: 'white', fontSize: '13px' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
            Longitude (°):
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              step="0.1"
              style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #444', background: '#1a1a1a', color: 'white', fontSize: '13px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(100, 149, 237, 0.1)', borderRadius: '8px', border: '1px solid rgba(100, 149, 237, 0.3)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6495ed' }}>🕐 Date et Heure</h3>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #444', background: '#1a1a1a', color: 'white', fontSize: '13px' }}
            />
          </label>
          <label style={{ display: 'block', fontSize: '13px' }}>
            Heure:
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #444', background: '#1a1a1a', color: 'white', fontSize: '13px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(50, 205, 50, 0.1)', borderRadius: '8px', border: '1px solid rgba(50, 205, 50, 0.3)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#32cd32' }}>☀️ Position Solaire</h3>
          <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
            <div>Azimuth: <strong style={{ color: '#ffa500' }}>{azimuth.toFixed(1)}°</strong></div>
            <div>Élévation: <strong style={{ color: '#ffa500' }}>{elevation.toFixed(1)}°</strong></div>
          </div>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(138, 43, 226, 0.1)', borderRadius: '8px', border: '1px solid rgba(138, 43, 226, 0.3)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#8a2be2' }}>🎮 Contrôle du Panneau</h3>

          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoTrack}
              onChange={(e) => setAutoTrack(e.target.checked)}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            />
            <strong>Suivi Automatique</strong>
          </label>

          {!autoTrack && (
            <>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px' }}>
                Azimuth Panneau (°):
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={panelTiltX}
                  onChange={(e) => setPanelTiltX(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '6px' }}
                />
                <div style={{ textAlign: 'center', marginTop: '4px', color: '#8a2be2', fontWeight: 'bold' }}>{panelTiltX.toFixed(1)}°</div>
              </label>
              <label style={{ display: 'block', fontSize: '13px' }}>
                Élévation Panneau (°):
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={panelTiltY}
                  onChange={(e) => setPanelTiltY(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '6px' }}
                />
                <div style={{ textAlign: 'center', marginTop: '4px', color: '#8a2be2', fontWeight: 'bold' }}>{panelTiltY.toFixed(1)}°</div>
              </label>
            </>
          )}
        </div>

        <div style={{
          padding: '15px',
          background: `linear-gradient(135deg, rgba(255, 0, 0, ${1 - efficiency / 100}) 0%, rgba(0, 255, 0, ${efficiency / 100}) 100%)`,
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>⚡ Efficacité</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
            {efficiency.toFixed(1)}%
          </div>
        </div>
      </div>

      <SolarSimulator
        sunAzimuth={azimuth}
        sunElevation={elevation}
        panelAzimuth={panelTiltX}
        panelElevation={panelTiltY}
        efficiency={efficiency}
      />
    </div>
  )
}
