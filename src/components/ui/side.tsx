"use client";

import { useRouter } from "next/navigation";
import { FaCodeBranch, FaClipboardCheck, FaCode} from "react-icons/fa";
import { Card } from "@/components/ui/card";

const Side = () => {
  const router = useRouter();

  return (
    <Card className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <ul className="space-y-10">
        <li className="flex items-center cursor-pointer hover:bg-gray-700 rounded-md" onClick={() => router.push("/collab")}> 
          <FaCode size={24}/>
        </li>
        <li className="flex items-center cursor-pointer hover:bg-gray-700 rounded-md" onClick={() => router.push("/commit")}> 
          <FaClipboardCheck size={24}/>
        </li>
        <li className="flex items-center cursor-pointer hover:bg-gray-700 rounded-md" onClick={() => router.push("/prs")}> 
          <FaCodeBranch size={24}/>
        </li>
      </ul>
    </Card>
  );
};

export default Side;
