import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { isAddress } from 'viem';

export function useRole() {
  const { address, isConnected } = useAccount();

  // Check if contract address is valid
  const isValidContract = CONTRACT_ADDRESS && isAddress(CONTRACT_ADDRESS) && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

  // Get owner address (always fetch if contract is valid)
  const { 
    data: ownerAddress, 
    isLoading: isLoadingOwner,
    error: ownerError,
    isError: isOwnerError 
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
    query: {
      enabled: isValidContract && isConnected,
    },
  });

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    if (isOwnerError) {
      console.error('Error fetching owner:', ownerError);
    }
    if (ownerAddress) {
      console.log('Contract owner address:', ownerAddress);
    }
  }

  // Get actor role (only if user is connected and not the owner)
  const { 
    data: actorRole, 
    isLoading: isLoadingRole,
    error: roleError,
    isError: isRoleError 
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActorRole',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && isValidContract,
    },
  });

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    if (isRoleError) {
      console.error('Error fetching actor role:', roleError);
    }
    if (actorRole !== undefined) {
      console.log('Actor role:', actorRole);
    }
  }

  // Determine if user is owner (case-insensitive comparison)
  const isOwner = address && ownerAddress && 
    address.toLowerCase() === ownerAddress.toLowerCase();

  // Map role enum to string
  const roleMap = {
    0: 'Consumer',
    1: 'Manufacturer',
    2: 'RawMaterialSupplier',
    3: 'Distributor',
  };

  // Determine role: Owner takes precedence, then actor role, then null
  let role = null;
  if (isOwner) {
    role = 'Owner';
  } else if (actorRole !== undefined && actorRole !== null) {
    role = roleMap[Number(actorRole)] || null;
  }

  // Loading state: true if either owner or role is loading
  const isLoading = isLoadingOwner || (isLoadingRole && !isOwner);

  return {
    role,
    isOwner,
    isLoading,
    address,
    isConnected,
    ownerAddress, // Expose for debugging
    ownerError, // Expose for debugging
    roleError, // Expose for debugging
  };
}

