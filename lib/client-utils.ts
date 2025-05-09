export const getLoggedInToken = (): string | null => {
  try{
    return localStorage.getItem('token');
  }
  catch(err){
    console.log(err)
    return null
  }
  
};
