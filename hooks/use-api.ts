import { useState, useCallback } from 'react';

export function useApi<T extends { success: boolean; error?: string }>(
  apiFunction: (...args: any[]) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  console.log('ssss', data, );
  const execute = useCallback(
    
    async (...args: any[]) => {
      setIsLoading(true);
      setError(null);
      setData(null);
      try {
        console.log('tosl', args)
        console.log(args.length)

        let data = args[0]
        if (args.length > 1){
          data = args[1]
          data['token'] = args[0]
        }
        console.log(data)
        const response = await apiFunction(data);
        console.log(response, 'whubw')
        if (!response.success) {
          // Handle unsuccessful response by setting error state and returning null.
          const errorMessage = response.error || 'An unknown error occurred';
          setIsLoading(false);
          setError(errorMessage);
          setSuccess(response.success);
          return null;
        } else {
          setSuccess(response.success);
          setData(response);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setSuccess(false);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, error, isLoading, success, execute };
}
