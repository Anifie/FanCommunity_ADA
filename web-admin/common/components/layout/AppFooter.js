//import Image from 'next/image'

const AppFooter = () => {
    return (
        <footer className="flex mt-8 h-24 w-full items-center justify-center border-t">
            {new Date().getFullYear()} &copy; Anifie Inc.
            {/* <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} /> */}        
        </footer>
    );
}

export default AppFooter