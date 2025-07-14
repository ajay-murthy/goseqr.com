import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entityInfoSchema, type EntityInfo } from "@shared/schema";

interface EntityFormProps {
  onAnalyze: (entityInfo: EntityInfo) => void;
  isAnalyzing: boolean;
}

export function EntityForm({ onAnalyze, isAnalyzing }: EntityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EntityInfo>({
    resolver: zodResolver(entityInfoSchema),
  });

  const onSubmit = (data: EntityInfo) => {
    onAnalyze(data);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Entity Information</h2>
        <p className="text-gray-600 mb-6">
          Please provide information about the data entities mentioned in your document:
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="dataSubject" className="text-sm font-medium text-gray-800">
              Data Subject
            </Label>
            <Input
              id="dataSubject"
              {...register("dataSubject")}
              className="mt-1"
              placeholder="Who is the individual whose data is being processed?"
            />
            {errors.dataSubject && (
              <p className="text-sm text-red-600 mt-1">{errors.dataSubject.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              E.g., website visitors, customers, employees
            </p>
          </div>
          
          <div>
            <Label htmlFor="dataController" className="text-sm font-medium text-gray-800">
              Data Controller
            </Label>
            <Input
              id="dataController"
              {...register("dataController")}
              className="mt-1"
              placeholder="Who determines the purposes and means of processing?"
            />
            {errors.dataController && (
              <p className="text-sm text-red-600 mt-1">{errors.dataController.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              E.g., your company, organization name
            </p>
          </div>
          
          <div>
            <Label htmlFor="dataProcessor" className="text-sm font-medium text-gray-800">
              Data Processor
            </Label>
            <Input
              id="dataProcessor"
              {...register("dataProcessor")}
              className="mt-1"
              placeholder="Who processes data on behalf of the controller?"
            />
            {errors.dataProcessor && (
              <p className="text-sm text-red-600 mt-1">{errors.dataProcessor.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              E.g., third-party service providers, cloud services
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium"
              disabled={isAnalyzing}
            >
              <Search className="w-4 h-4 mr-2" />
              {isAnalyzing ? 'Analyzing Document...' : 'Analyze Document'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
