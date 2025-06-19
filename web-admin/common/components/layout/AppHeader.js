// import Image from 'next/image'
import { faSearch, faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classes from './AppHeader.module.css'
import { useContext, useEffect, useState } from 'react'
import AuthButton from '../../../modules/Authentication/components/AuthButton'

//import { useWeb3 } from '../../hooks'

const AppHeader = () => {
    
    //const { web3Provider, connect, disconnect } = useWeb3()

    // useEffect(() => {

    // })
  
    return (
            <header className={`left-60 fixed top-0 right-0 z-10 h-14 ${process.env.IS_TEST == 'true' ? 'bg-[#001C57]' : 'bg-[#292E32]'}`}>
                <div className="flex justify-between">
                    <div className="flex justify-start items-center">
                        {/* <button className='btn btn-sm btn-ghost px-3 flex items-center h-14 rounded-none'>
                            <span className={`${classes.hamburgerIcon}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button> */}
                        <div className='px-3 flex items-center h-14 rounded-none'>
                            <span className={`${classes.hamburgerIcon}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </div>
                        <div className='relative flex items-center text-slate-100'>
                            <span>{process.env.TITLE} Admin Portal</span>
                            {/* <input type="text" className='border-0 h-10 pl-8 pr-2 bg-[#202328] text-sm' placeholder="Search..." autoComplete="off" id="search-options" />
                            <FontAwesomeIcon icon={faSearch} className="absolute z-10 text-sm left-2 w-4" /> */}
                        </div>
                    </div>
                    <div className={`flex items-center mr-6 h-14 justify-center w-fit ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#31373C]'} `}>
                        <AuthButton />
                    </div>
                </div>
            </header>
    );
}

export default AppHeader;