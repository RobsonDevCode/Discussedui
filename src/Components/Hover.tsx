export function HoverContainer({children, className}: {
    children: React.ReactNode;
    className?: string;
}){
    return <div className="p-3 transition-all rounded-full cursor-pointer hover:bg-gray-200 w-fit">
            {children}
    </div>
}

export function ItemHover({children, className}: {
    children: React.ReactNode;
    className?: string;
}){
    return <div className="p-3 transition-all rounded-full cursor-pointer hover:bg-zinc-900 w-fit">
            {children}
    </div>
}