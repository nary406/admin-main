import React, { useEffect } from 'react'
import Cookies from 'js-cookie';
import Navbar from './Navbar';

const Location = () => {
    useEffect(() => {
        if (!Cookies.get('token') || Cookies.get('role') !== "Admin") {
            window.location.href = "/";
        }
    }, [])

    return (
        <div className='flex flex-col w-full max-h-screen'>
            <div className='fixed w-full'>
                <Navbar />
            </div>
            <div className='w-full h-screen'>
                <iframe src="https://maps.re4billion.ai/" title="RE4BILLION Map" className='h-screen w-full' ></iframe>
            </div>
        </div>
    )
}

export default Location