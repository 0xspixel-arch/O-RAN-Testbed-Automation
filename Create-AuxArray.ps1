# --------------------------------------------------------------
# Create‑AuxArray.ps1 – combine USB sticks/HDDs into one storage‑space
# --------------------------------------------------------------

# 1.  Find every USB physical disk that can be pooled
Write-Host "`n--- Step 1: Discovering USB disks that can be pooled ---"

$UsbDisks = Get-PhysicalDisk |
    Where-Object { $_.BusType -eq 'USB' -and $_.CanPool -eq $true }

if ($UsbDisks.Count -lt 2) {
    Write-Error "At least two USB disks are required. Found $($UsbDisks.Count)."
    exit 1
}

$UsbDisks | Format-Table FriendlyName, MediaType, Size -AutoSize

Read-Host "`nPress ENTER to continue (or CTRL‑C to abort)"

# --------------------------------------------------------------
# 2.  Create the storage pool
# --------------------------------------------------------------
$PoolName = "AuxUSBPool"

Write-Host "`n--- Step 2: Creating storage pool '$PoolName' ---"

try {
    New-StoragePool -FriendlyName $PoolName `
                    -StorageSubsystemFriendlyName "Windows Storage*" `
                    -PhysicalDisks $UsbDisks -ErrorAction Stop
    
    $Pool = Get-StoragePool -FriendlyName $PoolName
    Write-Host "Pool created: $($Pool.FriendlyName)  Size: $([math]::Round($Pool.Size/1TB,2)) TB"
} catch {
    Write-Error "Failed to create storage pool: $_"
    exit 1
}

# --------------------------------------------------------------
# 3.  Create a *simple* (spanned) virtual disk that uses the whole pool
# --------------------------------------------------------------
$VdiskName = "AuxUSBArray"

Write-Host "`n--- Step 3: Creating simple virtual disk '$VdiskName' ---"

try {
    New-VirtualDisk -StoragePoolFriendlyName $Pool.FriendlyName `
                    -FriendlyName $VdiskName `
                    -ResiliencySettingName "Simple" `
                    -UseMaximumSize `
                    -ProvisioningType Fixed `
                    -ErrorAction Stop
    
    $Vdisk = Get-VirtualDisk -FriendlyName $VdiskName
    Write-Host "Virtual disk created: $($Vdisk.FriendlyName)  Size: $([math]::Round($Vdisk.Size/1TB,2)) TB"
} catch {
    Write-Error "Failed to create virtual disk: $_"
    exit 1
}

# --------------------------------------------------------------
# 4.  Initialise, partition and format the new volume
# --------------------------------------------------------------
Write-Host "`n--- Step 4: Initialising & formatting ---"

# Wait a moment for the system to recognize the new virtual disk
Start-Sleep -Seconds 2

# Get the disk using the virtual disk's unique ID for more reliable matching
$Disk = Get-Disk | Where-Object { $_.UniqueId -eq $Vdisk.UniqueId }

if (-not $Disk) {
    Write-Error "Could not find the disk for virtual disk '$VdiskName'"
    exit 1
}

try {
    $Disk | Initialize-Disk -PartitionStyle GPT -PassThru `
              | New-Partition -AssignDriveLetter -UseMaximumSize `
              | Format-Volume -FileSystem NTFS `
                             -NewFileSystemLabel "AuxArray" `
                             -AllocationUnitSize 65536 `
                             -Confirm:$false
    
    $Volume = Get-Volume -FileSystemLabel 'AuxArray'
    Write-Host "`n✅  All done!  The new array is mounted as drive $($Volume.DriveLetter):"
} catch {
    Write-Error "Failed to initialize and format disk: $_"
    exit 1
}

