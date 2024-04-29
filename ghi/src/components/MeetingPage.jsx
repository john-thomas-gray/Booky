import useAuthService from '../hooks/useAuthService'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function MeetingPage() {
    const { MeetingID } = useParams()
    return (
    <>
    <div>Meeting Page</div>
    </>
    )
}
