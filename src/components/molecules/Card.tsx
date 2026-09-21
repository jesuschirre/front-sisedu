interface CardProps {
  title: string;
  description: string;
  icon?: React.ElementType;
}

export default function Card({ title, description, icon: Icon }: CardProps) {
  return (
    <div className="flex flex-col gap-3 group w-full cursor-pointer font-mono">
      
      <div className="border-4 border-white bg-black px-4 py-3">
        <h3 className="font-bold text-2xl text-center text-white tracking-wide">
          {title}
        </h3>
      </div>

      <div className="border-4 border-white bg-black p-6 relative flex flex-col items-center gap-6">
        

        <div className="mt-6 flex justify-center">
          {Icon && <Icon size={72} strokeWidth={2.5} className="text-white" />}
        </div>
        
        <p className="text-center text-gray-200 text-lg font-medium leading-relaxed">
          {description}
        </p>
        
      </div>
      
    </div>
  );
}