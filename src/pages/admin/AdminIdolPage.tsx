import {
  ArrowLeft,
  CalendarDays,
  Edit,
  ImagePlus,
  Link as LinkIcon,
  Mail,
  Music,
  Play,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react'
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

/*
 * TYPES
 */

interface IdolMember {
  id: number
  groupId?: number
  name: string
  stageName: string
  position: string
  birthDate: string
  email: string
  bio: string
  imageUrl: string
  status: 'Active' | 'Inactive'
}

interface IdolRelease {
  id: number
  groupId?: number
  title: string
  type: 'Single' | 'EP' | 'Album'
  releaseDate: string
  description: string
  coverUrl: string
  audioUrl: string
  spotifyUrl: string
  youtubeUrl: string
  status: 'Released' | 'Upcoming'
}

interface IdolActivity {
  id: number
  groupId?: number
  title: string
  type:
  | 'Concert'
  | 'Fan Meeting'
  | 'Event'
  | 'Schedule'
  date: string
  location: string
  description: string
  imageUrl: string
  status:
  | 'Upcoming'
  | 'Completed'
  | 'Cancelled'
}

interface IdolMusicVideo {
  id: number
  groupId?: number
  releaseId?: number | null
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  youtubeUrl: string
  releaseDate: string
  status: 'Published' | 'Upcoming'
}

interface IdolGroup {
  id: number
  name: string
  description: string
  imageUrl: string
  status: 'Active' | 'Hiatus'
  members: IdolMember[]
  releases: IdolRelease[]
  activities: IdolActivity[]
  musicVideos: IdolMusicVideo[]
  memberCount: number
  releaseCount: number
  activityCount: number
  musicVideoCount: number
}

/*
 * API RESPONSE
 */

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/*
 * EMPTY FORMS
 */

const emptyGroupForm = {
  name: '',
  description: '',
  imageUrl: '',
  status: 'Active' as 'Active' | 'Hiatus',
}

const emptyMemberForm = {
  name: '',
  stageName: '',
  position: '',
  birthDate: '',
  email: '',
  bio: '',
  imageUrl: '',
  status: 'Active' as 'Active' | 'Inactive',
}

const emptyReleaseForm = {
  title: '',
  type: 'Single' as 'Single' | 'EP' | 'Album',
  releaseDate: '',
  description: '',
  coverUrl: '',
  audioUrl: '',
  spotifyUrl: '',
  youtubeUrl: '',
  status: 'Upcoming' as 'Released' | 'Upcoming',
}

const emptyActivityForm = {
  title: '',
  type: 'Event' as
    | 'Concert'
    | 'Fan Meeting'
    | 'Event'
    | 'Schedule',
  date: '',
  location: '',
  description: '',
  imageUrl: '',
  status: 'Upcoming' as
    | 'Upcoming'
    | 'Completed'
    | 'Cancelled',
}

const emptyMusicVideoForm = {
  title: '',
  description: '',
  thumbnailUrl: '',
  videoUrl: '',
  youtubeUrl: '',
  releaseDate: '',
  releaseId: '',
  status: 'Upcoming' as 'Published' | 'Upcoming',
}

/*
 * API HELPER
 */

function extractToken(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null

    try {
      const parsed = JSON.parse(trimmed)
      return extractToken(parsed)
    } catch {
      return trimmed
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const tokenKeys = [
      'token',
      'access_token',
      'accessToken',
      'admin_token',
      'adminToken',
      'session_token',
      'sessionToken',
    ]

    for (const key of tokenKeys) {
      const candidate = record[key]
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim()
      }
    }

    for (const key of ['data', 'auth', 'session', 'user']) {
      const candidate = extractToken(record[key])
      if (candidate) return candidate
    }
  }

  return null
}

function getStoredAuthTokens(): string[] {
  const tokens: string[] = []
  const seen = new Set<string>()

  const add = (value: unknown) => {
    const token = extractToken(value)
    if (token && !seen.has(token)) {
      seen.add(token)
      tokens.push(token)
    }
  }

  const preferredKeys = [
    'token',
    'auth_token',
    'access_token',
    'accessToken',
    'admin_token',
    'adminToken',
    'session_token',
    'sessionToken',
    'auth',
    'adminAuth',
    'user',
  ]

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of preferredKeys) {
      try {
        add(storage.getItem(key))
      } catch {
        // Ignore unavailable storage entries.
      }
    }

    try {
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index)
        if (!key || preferredKeys.includes(key)) continue
        add(storage.getItem(key))
      }
    } catch {
      // Ignore unavailable storage entries.
    }
  }

  return tokens
}

async function getAdminToken(): Promise<string | null> {
  const candidates = getStoredAuthTokens()

  for (const token of candidates) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      })

      if (response.ok) return token
    } catch {
      // Try the next stored token.
    }
  }

  return null
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = await getAdminToken()

  if (!token) {
    throw new Error(
      'Admin session not found or expired. Please login again.',
    )
  }

  const headers = new Headers(options?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Accept', 'application/json')

  if (!(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  } else {
    // Do not set Content-Type manually for FormData.
    // The browser must add the multipart boundary automatically.
    headers.delete('Content-Type')
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
      cache: 'no-store',
    },
  )

  let result: ApiResponse<T>

  try {
    result = await response.json()
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`,
    )
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
      `Request failed with status ${response.status}.`,
    )
  }

  return result.data
}

/*
 * NORMALIZERS
 *
 * Backend menggunakan snake_case.
 * Frontend menggunakan camelCase.
 */

function normalizeMember(
  member: any,
): IdolMember {
  return {
    id: Number(member.id),
    groupId:
      member.group_id !== undefined
        ? Number(member.group_id)
        : undefined,
    name: member.name ?? '',
    stageName: member.stage_name ?? '',
    position: member.position ?? '',
    birthDate: member.birth_date ?? '',
    email: member.email ?? '',
    bio: member.bio ?? '',
    imageUrl: member.image_url ?? '',
    status:
      member.status === 'Inactive'
        ? 'Inactive'
        : 'Active',
  }
}

function normalizeRelease(
  release: any,
): IdolRelease {
  return {
    id: Number(release.id),
    groupId:
      release.group_id !== undefined
        ? Number(release.group_id)
        : undefined,
    title: release.title ?? '',
    type:
      release.type === 'Album'
        ? 'Album'
        : release.type === 'EP'
          ? 'EP'
          : 'Single',
    releaseDate: release.release_date ?? '',
    description: release.description ?? '',
    coverUrl: release.cover_url ?? '',
    audioUrl: release.audio_url ?? '',
    spotifyUrl: release.spotify_url ?? '',
    youtubeUrl: release.youtube_url ?? '',
    status:
      release.status === 'Released'
        ? 'Released'
        : 'Upcoming',
  }
}

function normalizeActivity(
  activity: any,
): IdolActivity {
  return {
    id: Number(activity.id),
    groupId:
      activity.group_id !== undefined
        ? Number(activity.group_id)
        : undefined,
    title: activity.title ?? '',
    type:
      activity.type === 'Concert'
        ? 'Concert'
        : activity.type === 'Fan Meeting'
          ? 'Fan Meeting'
          : activity.type === 'Schedule'
            ? 'Schedule'
            : 'Event',
    date: activity.date ?? '',
    location: activity.location ?? '',
    description: activity.description ?? '',
    imageUrl: activity.image_url ?? '',
    status:
      activity.status === 'Completed'
        ? 'Completed'
        : activity.status === 'Cancelled'
          ? 'Cancelled'
          : 'Upcoming',
  }
}

function normalizeMusicVideo(
  video: any,
): IdolMusicVideo {
  return {
    id: Number(video.id),
    groupId:
      video.group_id !== undefined
        ? Number(video.group_id)
        : undefined,
    releaseId:
      video.release_id !== null &&
        video.release_id !== undefined
        ? Number(video.release_id)
        : null,
    title: video.title ?? '',
    description: video.description ?? '',
    thumbnailUrl: video.thumbnail_url ?? '',
    videoUrl: video.video_url ?? '',
    youtubeUrl: video.youtube_url ?? '',
    releaseDate: video.release_date ?? '',
    status:
      video.status === 'Published'
        ? 'Published'
        : 'Upcoming',
  }
}

function normalizeGroup(
  group: any,
): IdolGroup {
  return {
    id: Number(group.id),
    name: group.name ?? '',
    description: group.description ?? '',
    imageUrl: group.image_url ?? '',
    status:
      group.status === 'Hiatus'
        ? 'Hiatus'
        : 'Active',
    members: Array.isArray(group.members)
      ? group.members.map(normalizeMember)
      : [],
    releases: Array.isArray(group.releases)
      ? group.releases.map(normalizeRelease)
      : [],
    activities: Array.isArray(group.activities)
      ? group.activities.map(normalizeActivity)
      : [],
    musicVideos: Array.isArray(
      group.music_videos,
    )
      ? group.music_videos.map(
        normalizeMusicVideo,
      )
      : [],
    memberCount: Number(group.member_count ?? 0),
    releaseCount: Number(group.release_count ?? 0),
    activityCount: Number(
      group.activity_count ??
      group.upcoming_event_count ??
      0,
    ),
    musicVideoCount: Number(
      group.music_video_count ?? 0,
    ),
  }
}

function normalizeGroupList(
  group: any,
): IdolGroup {
  return {
    id: Number(group.id),
    name: group.name ?? '',
    description: group.description ?? '',
    imageUrl: group.image_url ?? '',
    status:
      group.status === 'Hiatus'
        ? 'Hiatus'
        : 'Active',
    members: [],
    releases: [],
    activities: [],
    musicVideos: [],
    memberCount: Number(
      group.member_count ?? 0,
    ),
    releaseCount: Number(
      group.release_count ?? 0,
    ),
    activityCount: Number(
      group.activity_count ??
      group.upcoming_event_count ??
      0,
    ),
    musicVideoCount: Number(
      group.music_video_count ?? 0,
    ),
  }
}

function formatDate(date: string) {
  if (!date) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

/*
 * IMAGE UPLOAD
 *
 * Same storage strategy as Product:
 * - source file: maximum 5 MB
 * - stored image: maximum 150 KB
 * - GIF is kept only when already <= 150 KB
 * - other formats are converted to WEBP when compression is needed
 */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_STORED_IMAGE_SIZE = 150 * 1024
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

async function compressIdolImage(file: File): Promise<File> {
  if (file.type === 'image/gif') {
    if (file.size > MAX_STORED_IMAGE_SIZE) {
      throw new Error(
        'GIF image must not exceed 150 KB. Please use JPG, PNG, or WEBP for larger images.',
      )
    }
    return file
  }

  if (file.size <= MAX_STORED_IMAGE_SIZE) return file

  const bitmap = await createImageBitmap(file)
  const dimensions = [1200, 1000, 800, 700, 600, 500, 400]
  const qualities = [0.82, 0.72, 0.62, 0.52, 0.42, 0.34, 0.28]

  try {
    for (const maxDimension of dimensions) {
      const scale = Math.min(
        1,
        maxDimension / Math.max(bitmap.width, bitmap.height),
      )
      const width = Math.max(1, Math.round(bitmap.width * scale))
      const height = Math.max(1, Math.round(bitmap.height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Your browser cannot process the idol image.')
      }

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(bitmap, 0, 0, width, height)

      for (const quality of qualities) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/webp', quality),
        )

        if (blob && blob.size <= MAX_STORED_IMAGE_SIZE) {
          return new File(
            [blob],
            `${file.name.replace(/\.[^.]+$/, '')}.webp`,
            {
              type: 'image/webp',
              lastModified: Date.now(),
            },
          )
        }
      }
    }
  } finally {
    bitmap.close()
  }

  throw new Error(
    'Image could not be compressed below 150 KB. Please choose a simpler or smaller image.',
  )
}

function validateIdolImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Image must be JPG, PNG, WEBP, or GIF.')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image size must not exceed 5 MB.')
  }
}

function handleIdolImageChange(
  event: React.ChangeEvent<HTMLInputElement>,
  setFile: (file: File | null) => void,
  setPreview: (preview: string) => void,
  setError: (message: string) => void,
) {
  const file = event.target.files?.[0]
  event.target.value = ''

  if (!file) return

  try {
    validateIdolImageFile(file)
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Invalid image file.')
    return
  }

  setFile(file)
  setPreview(URL.createObjectURL(file))
}


/*
 * PAGE
 */

export function AdminIdolPage() {
  const [groups, setGroups] =
    useState<IdolGroup[]>([])

  const [selectedGroupId, setSelectedGroupId] =
    useState<number | null>(null)

  const [search, setSearch] = useState('')

  const [isGroupModalOpen, setIsGroupModalOpen] =
    useState(false)

  const [isMemberModalOpen, setIsMemberModalOpen] =
    useState(false)

  const [isReleaseModalOpen, setIsReleaseModalOpen] =
    useState(false)

  const [isActivityModalOpen, setIsActivityModalOpen] =
    useState(false)

  const [
    isMusicVideoModalOpen,
    setIsMusicVideoModalOpen,
  ] = useState(false)

  const [editingGroup, setEditingGroup] =
    useState<IdolGroup | null>(null)

  const [editingMember, setEditingMember] =
    useState<IdolMember | null>(null)

  const [editingRelease, setEditingRelease] =
    useState<IdolRelease | null>(null)

  const [editingActivity, setEditingActivity] =
    useState<IdolActivity | null>(null)

  const [editingMusicVideo, setEditingMusicVideo] =
    useState<IdolMusicVideo | null>(null)

  const [groupForm, setGroupForm] =
    useState(emptyGroupForm)

  const [memberForm, setMemberForm] =
    useState(emptyMemberForm)

  const [releaseForm, setReleaseForm] =
    useState(emptyReleaseForm)

  const [activityForm, setActivityForm] =
    useState(emptyActivityForm)

  const [musicVideoForm, setMusicVideoForm] =
    useState(emptyMusicVideoForm)

  const [groupImageFile, setGroupImageFile] =
    useState<File | null>(null)
  const [groupImagePreview, setGroupImagePreview] =
    useState('')

  const [memberImageFile, setMemberImageFile] =
    useState<File | null>(null)
  const [memberImagePreview, setMemberImagePreview] =
    useState('')

  const [releaseImageFile, setReleaseImageFile] =
    useState<File | null>(null)
  const [releaseImagePreview, setReleaseImagePreview] =
    useState('')

  const [activityImageFile, setActivityImageFile] =
    useState<File | null>(null)
  const [activityImagePreview, setActivityImagePreview] =
    useState('')

  const [musicVideoImageFile, setMusicVideoImageFile] =
    useState<File | null>(null)
  const [musicVideoImagePreview, setMusicVideoImagePreview] =
    useState('')

  const [error, setError] = useState('')

  const [loading, setLoading] =
    useState(true)

  const [submitting, setSubmitting] =
    useState(false)

  /*
   * LOAD GROUPS
   */

  async function loadGroups(
    keepSelection = true,
  ) {
    try {
      setLoading(true)
      setError('')

      const data = await apiRequest<any[]>(
        '/api/idol/groups',
      )

      setGroups(
        Array.isArray(data)
          ? data.map(normalizeGroupList)
          : [],
      )

      if (
        !keepSelection &&
        selectedGroupId !== null
      ) {
        setSelectedGroupId(null)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load idol groups.',
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * LOAD GROUP DETAIL
   */

  async function loadGroupDetail(
    groupId: number,
  ) {
    try {
      setError('')

      const data = await apiRequest<any>(
        `/api/idol/groups/${groupId}`,
      )

      const normalized =
        normalizeGroup(data)

      setGroups((current) =>
        current.map((group) =>
          group.id === groupId
            ? normalized
            : group,
        ),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load group detail.',
      )
    }
  }

  useEffect(() => {
    loadGroups(false)
  }, [])

  useEffect(() => {
    if (selectedGroupId !== null) {
      loadGroupDetail(selectedGroupId)
    }
  }, [selectedGroupId])

  const selectedGroup = groups.find(
    (group) => group.id === selectedGroupId,
  )

  const filteredGroups = useMemo(() => {
    const searchValue =
      search.toLowerCase()

    return groups.filter((group) =>
      group.name
        .toLowerCase()
        .includes(searchValue),
    )
  }, [groups, search])

  const totalMembers = groups.reduce(
    (total, group) =>
      total + group.members.length,
    0,
  )

  const upcomingEvents = groups.reduce(
    (total, group) =>
      total +
      group.activities.filter(
        (activity) =>
          activity.status === 'Upcoming',
      ).length,
    0,
  )

  /*
   * GROUP
   */

  function openAddGroupModal() {
    setEditingGroup(null)
    setGroupForm({
      ...emptyGroupForm,
    })
    setGroupImageFile(null)
    setGroupImagePreview('')
    setError('')
    setIsGroupModalOpen(true)
  }

  function openEditGroupModal(
    group: IdolGroup,
  ) {
    setEditingGroup(group)

    setGroupForm({
      name: group.name,
      description: group.description,
      imageUrl: group.imageUrl,
      status: group.status,
    })
    setGroupImageFile(null)
    setGroupImagePreview(group.imageUrl || '')

    setError('')
    setIsGroupModalOpen(true)
  }

  function closeGroupModal() {
    setIsGroupModalOpen(false)
    setEditingGroup(null)
    setGroupForm({
      ...emptyGroupForm,
    })
    setGroupImageFile(null)
    setGroupImagePreview('')
    setError('')
  }

  async function handleGroupSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (submitting) return

    setError('')

    const name = groupForm.name.trim()
    const description = groupForm.description.trim()

    if (!name) {
      setError('Group name is required.')
      return
    }

    const duplicateName = groups.some(
      (group) =>
        group.name.toLowerCase() === name.toLowerCase() &&
        group.id !== editingGroup?.id,
    )

    if (duplicateName) {
      setError('A group with this name already exists.')
      return
    }

    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('status', groupForm.status)

      if (groupImageFile) {
        const compressedImage = await compressIdolImage(groupImageFile)
        formData.append('image', compressedImage)
      }

      const endpoint = editingGroup
        ? `/api/idol/groups/${editingGroup.id}`
        : '/api/idol/groups'

      await apiRequest(endpoint, {
        method: editingGroup ? 'PUT' : 'POST',
        body: formData,
      })

      closeGroupModal()
      await loadGroups()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save group.',
      )
    } finally {
      setSubmitting(false)
    }
  }


  async function handleDeleteGroup(
    id: number,
  ) {
    const group = groups.find(
      (item) => item.id === id,
    )

    if (!group) return

    const confirmed = window.confirm(
      `Delete group "${group.name}" and all of its members, releases, activities, and music videos?`,
    )

    if (!confirmed) return

    try {
      setError('')

      await apiRequest(
        `/api/idol/groups/${id}`,
        {
          method: 'DELETE',
        },
      )

      if (selectedGroupId === id) {
        setSelectedGroupId(null)
      }

      await loadGroups()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete group.',
      )
    }
  }

  /*
   * MEMBER
   */

  function openAddMemberModal() {
    if (!selectedGroup) return

    setEditingMember(null)
    setMemberForm({
      ...emptyMemberForm,
    })
    setMemberImageFile(null)
    setMemberImagePreview('')
    setError('')
    setIsMemberModalOpen(true)
  }

  function openEditMemberModal(
    member: IdolMember,
  ) {
    setEditingMember(member)

    setMemberForm({
      name: member.name,
      stageName: member.stageName,
      position: member.position,
      birthDate: member.birthDate,
      email: member.email,
      bio: member.bio,
      imageUrl: member.imageUrl,
      status: member.status,
    })
    setMemberImageFile(null)
    setMemberImagePreview(member.imageUrl || '')

    setError('')
    setIsMemberModalOpen(true)
  }

  function closeMemberModal() {
    setIsMemberModalOpen(false)
    setEditingMember(null)
    setMemberForm({
      ...emptyMemberForm,
    })
    setMemberImageFile(null)
    setMemberImagePreview('')
    setError('')
  }

  async function handleMemberSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (submitting) return

    setError('')

    if (!selectedGroup) {
      setError('Please select a group first.')
      return
    }

    const name = memberForm.name.trim()
    const stageName = memberForm.stageName.trim()
    const position = memberForm.position.trim()
    const email = memberForm.email.trim().toLowerCase()
    const bio = memberForm.bio.trim()

    if (!name) {
      setError('Member name is required.')
      return
    }

    if (!stageName) {
      setError('Stage name is required.')
      return
    }

    if (!position) {
      setError('Position is required.')
      return
    }

    if (!memberForm.birthDate) {
      setError('Birth date is required.')
      return
    }

    if (!email) {
      setError('Email is required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email.')
      return
    }

    const duplicateStageName = selectedGroup.members.some(
      (member) =>
        member.stageName.toLowerCase() === stageName.toLowerCase() &&
        member.id !== editingMember?.id,
    )

    if (duplicateStageName) {
      setError(
        'A member with this stage name already exists in this group.',
      )
      return
    }

    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append('name', name)
      formData.append('stage_name', stageName)
      formData.append('position', position)
      formData.append('birth_date', memberForm.birthDate)
      formData.append('email', email)
      formData.append('bio', bio)
      formData.append('status', memberForm.status)

      if (memberImageFile) {
        const compressedImage = await compressIdolImage(memberImageFile)
        formData.append('image', compressedImage)
      }

      const endpoint = editingMember
        ? `/api/idol/members/${editingMember.id}`
        : `/api/idol/groups/${selectedGroup.id}/members`

      await apiRequest(endpoint, {
        method: editingMember ? 'PUT' : 'POST',
        body: formData,
      })

      closeMemberModal()
      await loadGroupDetail(selectedGroup.id)
      await loadGroups()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save member.',
      )
    } finally {
      setSubmitting(false)
    }
  }


  async function handleDeleteMember(
    id: number,
  ) {
    if (!selectedGroup) return

    const member =
      selectedGroup.members.find(
        (item) => item.id === id,
      )

    if (!member) return

    const confirmed = window.confirm(
      `Delete member "${member.stageName}"?`,
    )

    if (!confirmed) return

    try {
      setError('')

      await apiRequest(
        `/api/idol/members/${id}`,
        {
          method: 'DELETE',
        },
      )

      await loadGroupDetail(
        selectedGroup.id,
      )
      await loadGroups()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete member.',
      )
    }
  }

  /*
   * RELEASE
   */

  function openAddReleaseModal() {
    if (!selectedGroup) return

    setEditingRelease(null)
    setReleaseForm({
      ...emptyReleaseForm,
    })
    setReleaseImageFile(null)
    setReleaseImagePreview('')
    setError('')
    setIsReleaseModalOpen(true)
  }

  function openEditReleaseModal(
    release: IdolRelease,
  ) {
    setEditingRelease(release)

    setReleaseForm({
      title: release.title,
      type: release.type,
      releaseDate: release.releaseDate,
      description: release.description,
      coverUrl: release.coverUrl,
      audioUrl: release.audioUrl,
      spotifyUrl: release.spotifyUrl,
      youtubeUrl: release.youtubeUrl,
      status: release.status,
    })
    setReleaseImageFile(null)
    setReleaseImagePreview(release.coverUrl || '')

    setError('')
    setIsReleaseModalOpen(true)
  }

  function closeReleaseModal() {
    setIsReleaseModalOpen(false)
    setEditingRelease(null)
    setReleaseForm({
      ...emptyReleaseForm,
    })
    setReleaseImageFile(null)
    setReleaseImagePreview('')
    setError('')
  }

  async function handleReleaseSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (submitting) return

    setError('')

    if (!selectedGroup) {
      setError('Please select a group first.')
      return
    }

    const title = releaseForm.title.trim()
    const description = releaseForm.description.trim()
    const audioUrl = releaseForm.audioUrl.trim()
    const spotifyUrl = releaseForm.spotifyUrl.trim()
    const youtubeUrl = releaseForm.youtubeUrl.trim()

    if (!title) {
      setError('Release title is required.')
      return
    }

    if (!releaseForm.releaseDate) {
      setError('Release date is required.')
      return
    }

    if (!description) {
      setError('Release description is required.')
      return
    }

    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append('title', title)
      formData.append('type', releaseForm.type)
      formData.append('release_date', releaseForm.releaseDate)
      formData.append('description', description)
      formData.append('audio_url', audioUrl)
      formData.append('spotify_url', spotifyUrl)
      formData.append('youtube_url', youtubeUrl)
      formData.append('status', releaseForm.status)

      if (releaseImageFile) {
        const compressedImage = await compressIdolImage(releaseImageFile)
        formData.append('image', compressedImage)
      }

      const endpoint = editingRelease
        ? `/api/idol/releases/${editingRelease.id}`
        : `/api/idol/groups/${selectedGroup.id}/releases`

      await apiRequest(endpoint, {
        method: editingRelease ? 'PUT' : 'POST',
        body: formData,
      })

      closeReleaseModal()
      await loadGroupDetail(selectedGroup.id)
      await loadGroups()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save release.',
      )
    } finally {
      setSubmitting(false)
    }
  }


  async function handleDeleteRelease(
    id: number,
  ) {
    if (!selectedGroup) return

    const release =
      selectedGroup.releases.find(
        (item) => item.id === id,
      )

    if (!release) return

    const confirmed = window.confirm(
      `Delete release "${release.title}"?`,
    )

    if (!confirmed) return

    try {
      setError('')

      await apiRequest(
        `/api/idol/releases/${id}`,
        {
          method: 'DELETE',
        },
      )

      await loadGroupDetail(
        selectedGroup.id,
      )
      await loadGroups()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete release.',
      )
    }
  }

  /*
   * ACTIVITY
   */

  function openAddActivityModal() {
    if (!selectedGroup) return

    setEditingActivity(null)
    setActivityForm({
      ...emptyActivityForm,
    })
    setActivityImageFile(null)
    setActivityImagePreview('')
    setError('')
    setIsActivityModalOpen(true)
  }

  function openEditActivityModal(
    activity: IdolActivity,
  ) {
    setEditingActivity(activity)

    setActivityForm({
      title: activity.title,
      type: activity.type,
      date: activity.date,
      location: activity.location,
      description: activity.description,
      imageUrl: activity.imageUrl,
      status: activity.status,
    })
    setActivityImageFile(null)
    setActivityImagePreview(activity.imageUrl || '')

    setError('')
    setIsActivityModalOpen(true)
  }

  function closeActivityModal() {
    setIsActivityModalOpen(false)
    setEditingActivity(null)
    setActivityForm({
      ...emptyActivityForm,
    })
    setActivityImageFile(null)
    setActivityImagePreview('')
    setError('')
  }

  async function handleActivitySubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (submitting) return

    setError('')

    if (!selectedGroup) {
      setError('Please select a group first.')
      return
    }

    const title = activityForm.title.trim()
    const location = activityForm.location.trim()
    const description = activityForm.description.trim()

    if (!title) {
      setError('Activity title is required.')
      return
    }

    if (!activityForm.date) {
      setError('Activity date is required.')
      return
    }

    if (!location) {
      setError('Location is required.')
      return
    }

    if (!description) {
      setError('Activity description is required.')
      return
    }

    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append('title', title)
      formData.append('type', activityForm.type)
      formData.append('date', activityForm.date)
      formData.append('location', location)
      formData.append('description', description)
      formData.append('status', activityForm.status)

      if (activityImageFile) {
        const compressedImage = await compressIdolImage(activityImageFile)
        formData.append('image', compressedImage)
      }

      const endpoint = editingActivity
        ? `/api/idol/activities/${editingActivity.id}`
        : `/api/idol/groups/${selectedGroup.id}/activities`

      await apiRequest(endpoint, {
        method: editingActivity ? 'PUT' : 'POST',
        body: formData,
      })

      closeActivityModal()
      await loadGroupDetail(selectedGroup.id)
      await loadGroups()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save activity.',
      )
    } finally {
      setSubmitting(false)
    }
  }


  async function handleDeleteActivity(
    id: number,
  ) {
    if (!selectedGroup) return

    const activity =
      selectedGroup.activities.find(
        (item) => item.id === id,
      )

    if (!activity) return

    const confirmed = window.confirm(
      `Delete activity "${activity.title}"?`,
    )

    if (!confirmed) return

    try {
      setError('')

      await apiRequest(
        `/api/idol/activities/${id}`,
        {
          method: 'DELETE',
        },
      )

      await loadGroupDetail(
        selectedGroup.id,
      )
      await loadGroups()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete activity.',
      )
    }
  }

  /*
   * MUSIC VIDEO
   */

  function openAddMusicVideoModal() {
    if (!selectedGroup) return

    setEditingMusicVideo(null)

    setMusicVideoForm({
      ...emptyMusicVideoForm,
    })
    setMusicVideoImageFile(null)
    setMusicVideoImagePreview('')

    setError('')
    setIsMusicVideoModalOpen(true)
  }

  function openEditMusicVideoModal(
    video: IdolMusicVideo,
  ) {
    setEditingMusicVideo(video)

    setMusicVideoForm({
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      youtubeUrl: video.youtubeUrl,
      releaseDate: video.releaseDate,
      releaseId:
        video.releaseId !== null &&
          video.releaseId !== undefined
          ? String(video.releaseId)
          : '',
      status: video.status,
    })
    setMusicVideoImageFile(null)
    setMusicVideoImagePreview(video.thumbnailUrl || '')

    setError('')
    setIsMusicVideoModalOpen(true)
  }

  function closeMusicVideoModal() {
    setIsMusicVideoModalOpen(false)
    setEditingMusicVideo(null)
    setMusicVideoForm({
      ...emptyMusicVideoForm,
    })
    setMusicVideoImageFile(null)
    setMusicVideoImagePreview('')
    setError('')
  }

  async function handleMusicVideoSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (submitting) return

    setError('')

    if (!selectedGroup) {
      setError('Please select a group first.')
      return
    }

    const title = musicVideoForm.title.trim()
    const description = musicVideoForm.description.trim()
    const videoUrl = musicVideoForm.videoUrl.trim()
    const youtubeUrl = musicVideoForm.youtubeUrl.trim()

    if (!title) {
      setError('Music video title is required.')
      return
    }

    if (!description) {
      setError('Music video description is required.')
      return
    }

    if (!videoUrl && !youtubeUrl) {
      setError('Please enter a video URL or YouTube URL.')
      return
    }

    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append('group_id', String(selectedGroup.id))
      formData.append(
        'release_id',
        musicVideoForm.releaseId
          ? String(Number(musicVideoForm.releaseId))
          : '',
      )
      formData.append('title', title)
      formData.append('description', description)
      formData.append('video_url', videoUrl)
      formData.append('youtube_url', youtubeUrl)
      formData.append('release_date', musicVideoForm.releaseDate)
      formData.append('status', musicVideoForm.status)

      if (musicVideoImageFile) {
        const compressedImage = await compressIdolImage(musicVideoImageFile)
        formData.append('image', compressedImage)
      }

      const endpoint = editingMusicVideo
        ? `/api/idol/music-videos/${editingMusicVideo.id}`
        : '/api/idol/music-videos'

      await apiRequest(endpoint, {
        method: editingMusicVideo ? 'PUT' : 'POST',
        body: formData,
      })

      closeMusicVideoModal()
      await loadGroupDetail(selectedGroup.id)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save music video.',
      )
    } finally {
      setSubmitting(false)
    }
  }


  async function handleDeleteMusicVideo(
    id: number,
  ) {
    if (!selectedGroup) return

    const video =
      selectedGroup.musicVideos.find(
        (item) => item.id === id,
      )

    if (!video) return

    const confirmed = window.confirm(
      `Delete music video "${video.title}"?`,
    )

    if (!confirmed) return

    try {
      setError('')

      await apiRequest(
        `/api/idol/music-videos/${id}`,
        {
          method: 'DELETE',
        },
      )

      await loadGroupDetail(
        selectedGroup.id,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete music video.',
      )
    }
  }

  /*
   * NAVIGATION
   */

  async function openGroup(
    groupId: number,
  ) {
    setSelectedGroupId(groupId)
    setSearch('')
    setError('')

    await loadGroupDetail(groupId)
  }

  function backToGroups() {
    setSelectedGroupId(null)
    setSearch('')
    setError('')
  }

  /*
   * RENDER
   */

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}

      <div>
        <p className="text-sm text-text-muted">
          Admin Panel
        </p>

        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">
          Idol Production
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Manage idol groups, members, releases,
          music videos, and activities.
        </p>
      </div>

      {error &&
        !isGroupModalOpen &&
        !isMemberModalOpen &&
        !isReleaseModalOpen &&
        !isActivityModalOpen &&
        !isMusicVideoModalOpen && (
          <ErrorMessage message={error} />
        )}

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat
          icon={
            <Music className="h-5 w-5" />
          }
          label="Groups"
          value={String(groups.length)}
        />

        <Stat
          icon={
            <Users className="h-5 w-5" />
          }
          label="Members"
          value={String(totalMembers)}
        />

        <Stat
          icon={
            <CalendarDays className="h-5 w-5" />
          }
          label="Upcoming Events"
          value={String(upcomingEvents)}
        />
      </div>

      {/* LOADING */}

      {loading && (
        <div className="rounded-xl border border-border-default bg-bg-surface px-6 py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />

          <p className="mt-4 text-sm text-text-muted">
            Loading idol production data...
          </p>
        </div>
      )}

      {/* GROUP LIST */}

      {!loading && !selectedGroup && (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-text-primary">
                Idol Groups
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Select a group to manage its
                production data.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddGroupModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
            >
              <Plus className="h-4 w-4" />
              Add Group
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search groups..."
              className="w-full rounded-lg border border-border-default bg-bg-surface py-3 pl-10 pr-4 text-sm text-text-primary outline-none transition focus:border-brand-primary"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map(
              (group) => (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-xl border border-border-default bg-bg-surface"
                >
                  {group.imageUrl ? (
                    <div className="h-40 overflow-hidden bg-bg-base">
                      <img
                        src={group.imageUrl}
                        alt={group.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-bg-base">
                      <Music className="h-10 w-10 text-brand-primary" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-brand-primary/10 p-3 text-brand-primary">
                        <Music className="h-6 w-6" />
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${group.status ===
                          'Active'
                          ? 'bg-green-400/10 text-green-400'
                          : 'bg-yellow-400/10 text-yellow-400'
                          }`}
                      >
                        {group.status}
                      </span>
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-text-primary">
                      {group.name}
                    </h2>

                    {group.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                        {group.description}
                      </p>
                    )}

                    <div className="mt-5 space-y-3 text-sm text-text-secondary">
                      <div className="flex justify-between">
                        <span>
                          Members
                        </span>

                        <span>
                          {group.memberCount}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>
                          Releases
                        </span>

                        <span>
                          {group.releaseCount}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>
                          Activities
                        </span>

                        <span>
                          {group.activityCount}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditGroupModal(
                            group,
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-default py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openGroup(
                            group.id,
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-secondary"
                      >
                        <Users className="h-4 w-4" />
                        Manage
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteGroup(
                          group.id,
                        )
                      }
                      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-red-400 transition-colors hover:bg-red-400/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Group
                    </button>
                  </div>
                </div>
              ),
            )}

            {filteredGroups.length ===
              0 && (
                <div className="rounded-xl border border-border-default bg-bg-surface px-6 py-16 text-center md:col-span-2 lg:col-span-3">
                  <Music className="mx-auto h-10 w-10 text-text-muted" />

                  <p className="mt-4 text-sm text-text-muted">
                    No idol groups found.
                  </p>
                </div>
              )}
          </div>
        </>
      )}

      {/* GROUP DETAIL */}

      {!loading && selectedGroup && (
        <>
          {/* DETAIL HEADER */}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={backToGroups}
                className="rounded-lg border border-border-default p-2.5 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
                title="Back to groups"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div>
                <p className="text-sm text-text-muted">
                  Idol Group
                </p>

                <h2 className="font-display text-2xl font-bold text-text-primary">
                  {selectedGroup.name}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  openEditGroupModal(
                    selectedGroup,
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
              >
                <Edit className="h-4 w-4" />
                Edit Group
              </button>

              <button
                type="button"
                onClick={openAddMemberModal}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </button>
            </div>
          </div>

          {/* GROUP IMAGE / DESCRIPTION */}

          {(selectedGroup.imageUrl ||
            selectedGroup.description) && (
              <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
                {selectedGroup.imageUrl && (
                  <div className="h-56 overflow-hidden bg-bg-base">
                    <img
                      src={
                        selectedGroup.imageUrl
                      }
                      alt={
                        selectedGroup.name
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {selectedGroup.description && (
                  <div className="p-6">
                    <p className="text-sm leading-7 text-text-secondary">
                      {
                        selectedGroup.description
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

          {/* GROUP SUMMARY */}

          <div className="grid gap-4 md:grid-cols-5">
            <DetailCard
              label="Status"
              value={
                selectedGroup.status
              }
            />

            <DetailCard
              label="Members"
              value={String(
                selectedGroup.members
                  .length,
              )}
            />

            <DetailCard
              label="Releases"
              value={String(
                selectedGroup.releases
                  .length,
              )}
            />

            <DetailCard
              label="Music Videos"
              value={String(
                selectedGroup
                  .musicVideos
                  .length,
              )}
            />

            <DetailCard
              label="Activities"
              value={String(
                selectedGroup.activities
                  .length,
              )}
            />
          </div>

          {/* MEMBERS */}

          <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
            <div className="flex flex-col gap-4 border-b border-border-default px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  Group Members
                </h3>

                <p className="mt-1 text-sm text-text-muted">
                  Manage members of{' '}
                  {
                    selectedGroup.name
                  }
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={openAddMemberModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-border-default bg-bg-base">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Member
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Position
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Birth Date
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Email
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Status
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedGroup.members.map(
                    (member) => (
                      <tr
                        key={member.id}
                        className="border-b border-border-default last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {member.imageUrl ? (
                              <img
                                src={
                                  member.imageUrl
                                }
                                alt={
                                  member.stageName
                                }
                                className="h-11 w-11 rounded-full object-cover"
                              />
                            ) : (
                              <div className="rounded-full bg-brand-primary/10 p-2.5 text-brand-primary">
                                <User className="h-5 w-5" />
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-text-primary">
                                {
                                  member.stageName
                                }
                              </p>

                              <p className="text-xs text-text-muted">
                                {
                                  member.name
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-text-secondary">
                          {
                            member.position
                          }
                        </td>

                        <td className="px-6 py-4 text-text-secondary">
                          {formatDate(
                            member.birthDate,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Mail className="h-4 w-4" />
                            {member.email}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={
                              member.status
                            }
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditMemberModal(
                                  member,
                                )
                              }
                              className="rounded-lg border border-border-default p-2 text-text-muted hover:text-text-primary"
                              title="Edit member"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMember(
                                  member.id,
                                )
                              }
                              className="rounded-lg border border-border-default p-2 text-red-400 hover:bg-red-400/10"
                              title="Delete member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                  {selectedGroup.members
                    .length === 0 && (
                      <EmptyTableRow
                        colSpan={6}
                        message="This group has no members yet."
                      />
                    )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RELEASES */}

          <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
            <div className="flex flex-col gap-4 border-b border-border-default px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  Releases
                </h3>

                <p className="mt-1 text-sm text-text-muted">
                  Manage releases from{' '}
                  {
                    selectedGroup.name
                  }
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={openAddReleaseModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary"
              >
                <Plus className="h-4 w-4" />
                Add Release
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-border-default bg-bg-base">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Release
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Type
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Release Date
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Media
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Status
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedGroup.releases.map(
                    (release) => (
                      <tr
                        key={release.id}
                        className="border-b border-border-default last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {release.coverUrl ? (
                              <img
                                src={
                                  release.coverUrl
                                }
                                alt={
                                  release.title
                                }
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="rounded-lg bg-brand-primary/10 p-3 text-brand-primary">
                                <Music className="h-5 w-5" />
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-text-primary">
                                {
                                  release.title
                                }
                              </p>

                              <p className="mt-1 max-w-md text-xs text-text-muted">
                                {
                                  release.description
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-bg-base px-3 py-1 text-xs text-text-secondary">
                            {
                              release.type
                            }
                          </span>
                        </td>

                        <td className="px-6 py-4 text-text-secondary">
                          {formatDate(
                            release.releaseDate,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {release.audioUrl && (
                              <span
                                title="Audio URL available"
                                className="rounded-lg bg-brand-primary/10 p-2 text-brand-primary"
                              >
                                <Play className="h-4 w-4" />
                              </span>
                            )}

                            {release.spotifyUrl && (
                              <span
                                title="Spotify URL available"
                                className="rounded-lg bg-green-400/10 p-2 text-green-400"
                              >
                                <LinkIcon className="h-4 w-4" />
                              </span>
                            )}

                            {release.youtubeUrl && (
                              <span
                                title="YouTube URL available"
                                className="rounded-lg bg-red-400/10 p-2 text-red-400"
                              >
                                <Play className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <ReleaseStatusBadge
                            status={
                              release.status
                            }
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditReleaseModal(
                                  release,
                                )
                              }
                              className="rounded-lg border border-border-default p-2 text-text-muted hover:text-text-primary"
                              title="Edit release"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteRelease(
                                  release.id,
                                )
                              }
                              className="rounded-lg border border-border-default p-2 text-red-400 hover:bg-red-400/10"
                              title="Delete release"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                  {selectedGroup.releases
                    .length === 0 && (
                      <EmptyTableRow
                        colSpan={6}
                        message="This group has no releases yet."
                      />
                    )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MUSIC VIDEOS */}

          <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
            <div className="flex flex-col gap-4 border-b border-border-default px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  Music Videos
                </h3>

                <p className="mt-1 text-sm text-text-muted">
                  Manage music videos for{' '}
                  {
                    selectedGroup.name
                  }
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={
                  openAddMusicVideoModal
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary"
              >
                <Plus className="h-4 w-4" />
                Add Music Video
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-border-default bg-bg-base">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Video
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Release Date
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Media
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Status
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedGroup.musicVideos.map(
                    (video) => (
                      <tr
                        key={video.id}
                        className="border-b border-border-default last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {video.thumbnailUrl ? (
                              <img
                                src={
                                  video.thumbnailUrl
                                }
                                alt={
                                  video.title
                                }
                                className="h-14 w-24 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-bg-base text-brand-primary">
                                <Play className="h-5 w-5" />
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-text-primary">
                                {
                                  video.title
                                }
                              </p>

                              <p className="mt-1 max-w-md text-xs text-text-muted">
                                {
                                  video.description
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-text-secondary">
                          {formatDate(
                            video.releaseDate,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {video.videoUrl && (
                              <span
                                className="rounded-lg bg-brand-primary/10 p-2 text-brand-primary"
                                title="Direct video URL"
                              >
                                <Play className="h-4 w-4" />
                              </span>
                            )}

                            {video.youtubeUrl && (
                              <span
                                className="rounded-lg bg-red-400/10 p-2 text-red-400"
                                title="YouTube URL"
                              >
                                <LinkIcon className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <MusicVideoStatusBadge
                            status={
                              video.status
                            }
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditMusicVideoModal(
                                  video,
                                )
                              }
                              className="rounded-lg border border-border-default p-2 text-text-muted hover:text-text-primary"
                              title="Edit music video"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMusicVideo(
                                  video.id,
                                )
                              }
                              className="rounded-lg border border-border-default p-2 text-red-400 hover:bg-red-400/10"
                              title="Delete music video"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                  {selectedGroup
                    .musicVideos.length ===
                    0 && (
                      <EmptyTableRow
                        colSpan={5}
                        message="This group has no music videos yet."
                      />
                    )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIVITIES */}

          <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
            <div className="flex flex-col gap-4 border-b border-border-default px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  Activities
                </h3>

                <p className="mt-1 text-sm text-text-muted">
                  Manage events and activities
                  for{' '}
                  {
                    selectedGroup.name
                  }
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={
                  openAddActivityModal
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary"
              >
                <Plus className="h-4 w-4" />
                Add Activity
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-border-default bg-bg-base">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Activity
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Type
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Date
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Location
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Status
                    </th>

                    <th className="px-6 py-4 font-semibold text-text-primary">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedGroup.activities.map(
                    (activity) => (
                      <tr
                        key={activity.id}
                        className="border-b border-border-default last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {activity.imageUrl ? (
                              <img
                                src={
                                  activity.imageUrl
                                }
                                alt={
                                  activity.title
                                }
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="rounded-lg bg-brand-primary/10 p-3 text-brand-primary">
                                <CalendarDays className="h-5 w-5" />
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-text-primary">
                                {
                                  activity.title
                                }
                              </p>

                              <p className="mt-1 max-w-md text-xs text-text-muted">
                                {
                                  activity.description
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-bg-base px-3 py-1 text-xs text-text-secondary">
                            {
                              activity.type
                            }
                          </span>
                        </td>

                        <td className="px-6 py-4 text-text-secondary">
                          {formatDate(
                            activity.date,
                          )}
                        </td>

                        <td className="px-6 py-4 text-text-secondary">
                          {
                            activity.location
                          }
                        </td>

                        <td className="px-6 py-4">
                          <ActivityStatusBadge
                            status={
                              activity.status
                            }
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditActivityModal(
                                  activity,
                                )
                              }
                              className="rounded-lg border border-border-default p-2 text-text-muted hover:text-text-primary"
                              title="Edit activity"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteActivity(
                                  activity.id,
                                )
                              }
                              className="rounded-lg border border-border-default p-2 text-red-400 hover:bg-red-400/10"
                              title="Delete activity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                  {selectedGroup.activities
                    .length === 0 && (
                      <EmptyTableRow
                        colSpan={6}
                        message="This group has no activities yet."
                      />
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* GROUP MODAL */}

      {isGroupModalOpen && (
        <Modal
          title={
            editingGroup
              ? 'Edit Group'
              : 'Add Group'
          }
          description="Manage idol group information."
          onClose={closeGroupModal}
        >
          <form
            onSubmit={handleGroupSubmit}
          >
            <div className="space-y-5 px-6 py-6">
              {error && (
                <ErrorMessage
                  message={error}
                />
              )}

              <FormField
                id="group-name"
                label="Group Name"
                value={groupForm.name}
                placeholder="e.g. LUMINA"
                onChange={(value) =>
                  setGroupForm(
                    (current) => ({
                      ...current,
                      name: value,
                    }),
                  )
                }
              />

              <div>
                <label
                  htmlFor="group-description"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Description
                </label>

                <textarea
                  id="group-description"
                  rows={4}
                  value={
                    groupForm.description
                  }
                  onChange={(event) =>
                    setGroupForm(
                      (current) => ({
                        ...current,
                        description:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="Describe the idol group..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <ImageUploadField
                id="group-image"
                label="Group Image"
                preview={groupImagePreview}
                onChange={(event) =>
                  handleIdolImageChange(
                    event,
                    setGroupImageFile,
                    setGroupImagePreview,
                    setError,
                  )
                }
              />

              <div>
                <label
                  htmlFor="group-status"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Status
                </label>

                <select
                  id="group-status"
                  value={
                    groupForm.status
                  }
                  onChange={(event) =>
                    setGroupForm(
                      (current) => ({
                        ...current,
                        status:
                          event.target
                            .value as
                          | 'Active'
                          | 'Hiatus',
                      }),
                    )
                  }
                  className={inputClass}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Hiatus">
                    Hiatus
                  </option>
                </select>
              </div>
            </div>

            <ModalFooter
              onCancel={closeGroupModal}
              submitLabel={
                submitting
                  ? 'Saving...'
                  : editingGroup
                    ? 'Save Changes'
                    : 'Create Group'
              }
            />
          </form>
        </Modal>
      )}

      {/* MEMBER MODAL */}

      {isMemberModalOpen &&
        selectedGroup && (
          <Modal
            title={
              editingMember
                ? 'Edit Member'
                : 'Add Member'
            }
            description={`Manage member information for ${selectedGroup.name}.`}
            onClose={closeMemberModal}
            wide
          >
            <form
              onSubmit={
                handleMemberSubmit
              }
            >
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <ErrorMessage
                    message={error}
                  />
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    id="member-name"
                    label="Full Name"
                    value={
                      memberForm.name
                    }
                    placeholder="e.g. Alya Putri"
                    onChange={(value) =>
                      setMemberForm(
                        (current) => ({
                          ...current,
                          name: value,
                        }),
                      )
                    }
                  />

                  <FormField
                    id="member-stage-name"
                    label="Stage Name"
                    value={
                      memberForm.stageName
                    }
                    placeholder="e.g. ALYA"
                    onChange={(value) =>
                      setMemberForm(
                        (current) => ({
                          ...current,
                          stageName:
                            value,
                        }),
                      )
                    }
                  />
                </div>

                <FormField
                  id="member-position"
                  label="Position"
                  value={
                    memberForm.position
                  }
                  placeholder="e.g. Leader, Main Vocal"
                  onChange={(value) =>
                    setMemberForm(
                      (current) => ({
                        ...current,
                        position: value,
                      }),
                    )
                  }
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="member-birth-date"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Birth Date
                    </label>

                    <input
                      id="member-birth-date"
                      type="date"
                      value={
                        memberForm.birthDate
                      }
                      onChange={(event) =>
                        setMemberForm(
                          (current) => ({
                            ...current,
                            birthDate:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="member-status"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Status
                    </label>

                    <select
                      id="member-status"
                      value={
                        memberForm.status
                      }
                      onChange={(event) =>
                        setMemberForm(
                          (current) => ({
                            ...current,
                            status:
                              event
                                .target
                                .value as
                              | 'Active'
                              | 'Inactive',
                          }),
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>

                <FormField
                  id="member-email"
                  label="Email"
                  type="email"
                  value={
                    memberForm.email
                  }
                  placeholder="member@39production.com"
                  onChange={(value) =>
                    setMemberForm(
                      (current) => ({
                        ...current,
                        email: value,
                      }),
                    )
                  }
                />

                <ImageUploadField
                  id="member-image"
                  label="Member Image"
                  preview={memberImagePreview}
                  rounded
                  onChange={(event) =>
                    handleIdolImageChange(
                      event,
                      setMemberImageFile,
                      setMemberImagePreview,
                      setError,
                    )
                  }
                />

                <div>
                  <label
                    htmlFor="member-bio"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Bio
                  </label>

                  <textarea
                    id="member-bio"
                    rows={5}
                    value={
                      memberForm.bio
                    }
                    onChange={(event) =>
                      setMemberForm(
                        (current) => ({
                          ...current,
                          bio: event
                            .target
                            .value,
                        }),
                      )
                    }
                    placeholder="Write member biography..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <ModalFooter
                onCancel={
                  closeMemberModal
                }
                submitLabel={
                  submitting
                    ? 'Saving...'
                    : editingMember
                      ? 'Save Changes'
                      : 'Create Member'
                }
              />
            </form>
          </Modal>
        )}

      {/* RELEASE MODAL */}

      {isReleaseModalOpen &&
        selectedGroup && (
          <Modal
            title={
              editingRelease
                ? 'Edit Release'
                : 'Add Release'
            }
            description={`Manage release information for ${selectedGroup.name}.`}
            onClose={
              closeReleaseModal
            }
            wide
          >
            <form
              onSubmit={
                handleReleaseSubmit
              }
            >
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <ErrorMessage
                    message={error}
                  />
                )}

                <FormField
                  id="release-title"
                  label="Release Title"
                  value={
                    releaseForm.title
                  }
                  placeholder="e.g. First Light"
                  onChange={(value) =>
                    setReleaseForm(
                      (current) => ({
                        ...current,
                        title: value,
                      }),
                    )
                  }
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="release-type"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Release Type
                    </label>

                    <select
                      id="release-type"
                      value={
                        releaseForm.type
                      }
                      onChange={(event) =>
                        setReleaseForm(
                          (current) => ({
                            ...current,
                            type:
                              event
                                .target
                                .value as
                              | 'Single'
                              | 'EP'
                              | 'Album',
                          }),
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      <option value="Single">
                        Single
                      </option>

                      <option value="EP">
                        EP
                      </option>

                      <option value="Album">
                        Album
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="release-date"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Release Date
                    </label>

                    <input
                      id="release-date"
                      type="date"
                      value={
                        releaseForm.releaseDate
                      }
                      onChange={(event) =>
                        setReleaseForm(
                          (current) => ({
                            ...current,
                            releaseDate:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="release-description"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Description
                  </label>

                  <textarea
                    id="release-description"
                    rows={4}
                    value={
                      releaseForm.description
                    }
                    onChange={(event) =>
                      setReleaseForm(
                        (current) => ({
                          ...current,
                          description:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="Describe this release..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <ImageUploadField
                  id="release-cover-image"
                  label="Cover Image"
                  preview={releaseImagePreview}
                  onChange={(event) =>
                    handleIdolImageChange(
                      event,
                      setReleaseImageFile,
                      setReleaseImagePreview,
                      setError,
                    )
                  }
                />

                <FormField
                  id="release-audio-url"
                  label="Audio URL"
                  value={
                    releaseForm.audioUrl
                  }
                  placeholder="https://..."
                  onChange={(value) =>
                    setReleaseForm(
                      (current) => ({
                        ...current,
                        audioUrl: value,
                      }),
                    )
                  }
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    id="release-spotify-url"
                    label="Spotify URL"
                    value={
                      releaseForm.spotifyUrl
                    }
                    placeholder="https://open.spotify.com/..."
                    onChange={(value) =>
                      setReleaseForm(
                        (current) => ({
                          ...current,
                          spotifyUrl:
                            value,
                        }),
                      )
                    }
                  />

                  <FormField
                    id="release-youtube-url"
                    label="YouTube URL"
                    value={
                      releaseForm.youtubeUrl
                    }
                    placeholder="https://youtube.com/..."
                    onChange={(value) =>
                      setReleaseForm(
                        (current) => ({
                          ...current,
                          youtubeUrl:
                            value,
                        }),
                      )
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="release-status"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Status
                  </label>

                  <select
                    id="release-status"
                    value={
                      releaseForm.status
                    }
                    onChange={(event) =>
                      setReleaseForm(
                        (current) => ({
                          ...current,
                          status:
                            event
                              .target
                              .value as
                            | 'Released'
                            | 'Upcoming',
                        }),
                      )
                    }
                    className={
                      inputClass
                    }
                  >
                    <option value="Released">
                      Released
                    </option>

                    <option value="Upcoming">
                      Upcoming
                    </option>
                  </select>
                </div>
              </div>

              <ModalFooter
                onCancel={
                  closeReleaseModal
                }
                submitLabel={
                  submitting
                    ? 'Saving...'
                    : editingRelease
                      ? 'Save Changes'
                      : 'Create Release'
                }
              />
            </form>
          </Modal>
        )}

      {/* MUSIC VIDEO MODAL */}

      {isMusicVideoModalOpen &&
        selectedGroup && (
          <Modal
            title={
              editingMusicVideo
                ? 'Edit Music Video'
                : 'Add Music Video'
            }
            description={`Manage music video information for ${selectedGroup.name}.`}
            onClose={
              closeMusicVideoModal
            }
            wide
          >
            <form
              onSubmit={
                handleMusicVideoSubmit
              }
            >
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <ErrorMessage
                    message={error}
                  />
                )}

                <FormField
                  id="music-video-title"
                  label="Video Title"
                  value={
                    musicVideoForm.title
                  }
                  placeholder="e.g. First Light MV"
                  onChange={(value) =>
                    setMusicVideoForm(
                      (current) => ({
                        ...current,
                        title: value,
                      }),
                    )
                  }
                />

                <div>
                  <label
                    htmlFor="music-video-description"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Description
                  </label>

                  <textarea
                    id="music-video-description"
                    rows={4}
                    value={
                      musicVideoForm.description
                    }
                    onChange={(event) =>
                      setMusicVideoForm(
                        (current) => ({
                          ...current,
                          description:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="Describe this music video..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <ImageUploadField
                  id="music-video-thumbnail-image"
                  label="Thumbnail Image"
                  preview={musicVideoImagePreview}
                  onChange={(event) =>
                    handleIdolImageChange(
                      event,
                      setMusicVideoImageFile,
                      setMusicVideoImagePreview,
                      setError,
                    )
                  }
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    id="music-video-video-url"
                    label="Direct Video URL"
                    value={
                      musicVideoForm.videoUrl
                    }
                    placeholder="https://..."
                    onChange={(value) =>
                      setMusicVideoForm(
                        (current) => ({
                          ...current,
                          videoUrl:
                            value,
                        }),
                      )
                    }
                  />

                  <FormField
                    id="music-video-youtube-url"
                    label="YouTube URL"
                    value={
                      musicVideoForm.youtubeUrl
                    }
                    placeholder="https://youtube.com/..."
                    onChange={(value) =>
                      setMusicVideoForm(
                        (current) => ({
                          ...current,
                          youtubeUrl:
                            value,
                        }),
                      )
                    }
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="music-video-release"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Related Release
                    </label>

                    <select
                      id="music-video-release"
                      value={
                        musicVideoForm.releaseId
                      }
                      onChange={(event) =>
                        setMusicVideoForm(
                          (current) => ({
                            ...current,
                            releaseId:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      <option value="">
                        No Release
                      </option>

                      {selectedGroup.releases.map(
                        (release) => (
                          <option
                            key={
                              release.id
                            }
                            value={
                              release.id
                            }
                          >
                            {
                              release.title
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="music-video-date"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Release Date
                    </label>

                    <input
                      id="music-video-date"
                      type="date"
                      value={
                        musicVideoForm.releaseDate
                      }
                      onChange={(event) =>
                        setMusicVideoForm(
                          (current) => ({
                            ...current,
                            releaseDate:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="music-video-status"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Status
                  </label>

                  <select
                    id="music-video-status"
                    value={
                      musicVideoForm.status
                    }
                    onChange={(event) =>
                      setMusicVideoForm(
                        (current) => ({
                          ...current,
                          status:
                            event
                              .target
                              .value as
                            | 'Published'
                            | 'Upcoming',
                        }),
                      )
                    }
                    className={
                      inputClass
                    }
                  >
                    <option value="Published">
                      Published
                    </option>

                    <option value="Upcoming">
                      Upcoming
                    </option>
                  </select>
                </div>
              </div>

              <ModalFooter
                onCancel={
                  closeMusicVideoModal
                }
                submitLabel={
                  submitting
                    ? 'Saving...'
                    : editingMusicVideo
                      ? 'Save Changes'
                      : 'Create Music Video'
                }
              />
            </form>
          </Modal>
        )}

      {/* ACTIVITY MODAL */}

      {isActivityModalOpen &&
        selectedGroup && (
          <Modal
            title={
              editingActivity
                ? 'Edit Activity'
                : 'Add Activity'
            }
            description={`Manage activity information for ${selectedGroup.name}.`}
            onClose={
              closeActivityModal
            }
            wide
          >
            <form
              onSubmit={
                handleActivitySubmit
              }
            >
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <ErrorMessage
                    message={error}
                  />
                )}

                <FormField
                  id="activity-title"
                  label="Activity Title"
                  value={
                    activityForm.title
                  }
                  placeholder="e.g. LUMINA Fan Meeting"
                  onChange={(value) =>
                    setActivityForm(
                      (current) => ({
                        ...current,
                        title: value,
                      }),
                    )
                  }
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="activity-type"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Activity Type
                    </label>

                    <select
                      id="activity-type"
                      value={
                        activityForm.type
                      }
                      onChange={(event) =>
                        setActivityForm(
                          (current) => ({
                            ...current,
                            type:
                              event
                                .target
                                .value as
                              | 'Concert'
                              | 'Fan Meeting'
                              | 'Event'
                              | 'Schedule',
                          }),
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      <option value="Concert">
                        Concert
                      </option>

                      <option value="Fan Meeting">
                        Fan Meeting
                      </option>

                      <option value="Event">
                        Event
                      </option>

                      <option value="Schedule">
                        Schedule
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="activity-date"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Date
                    </label>

                    <input
                      id="activity-date"
                      type="date"
                      value={
                        activityForm.date
                      }
                      onChange={(event) =>
                        setActivityForm(
                          (current) => ({
                            ...current,
                            date: event
                              .target
                              .value,
                          }),
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>
                </div>

                <FormField
                  id="activity-location"
                  label="Location"
                  value={
                    activityForm.location
                  }
                  placeholder="e.g. Jakarta Convention Center"
                  onChange={(value) =>
                    setActivityForm(
                      (current) => ({
                        ...current,
                        location: value,
                      }),
                    )
                  }
                />

                <div>
                  <label
                    htmlFor="activity-description"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Description
                  </label>

                  <textarea
                    id="activity-description"
                    rows={4}
                    value={
                      activityForm.description
                    }
                    onChange={(event) =>
                      setActivityForm(
                        (current) => ({
                          ...current,
                          description:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="Describe this activity..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <ImageUploadField
                  id="activity-image"
                  label="Activity Image"
                  preview={activityImagePreview}
                  onChange={(event) =>
                    handleIdolImageChange(
                      event,
                      setActivityImageFile,
                      setActivityImagePreview,
                      setError,
                    )
                  }
                />

                <div>
                  <label
                    htmlFor="activity-status"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Status
                  </label>

                  <select
                    id="activity-status"
                    value={
                      activityForm.status
                    }
                    onChange={(event) =>
                      setActivityForm(
                        (current) => ({
                          ...current,
                          status:
                            event
                              .target
                              .value as
                            | 'Upcoming'
                            | 'Completed'
                            | 'Cancelled',
                        }),
                      )
                    }
                    className={
                      inputClass
                    }
                  >
                    <option value="Upcoming">
                      Upcoming
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>
              </div>

              <ModalFooter
                onCancel={
                  closeActivityModal
                }
                submitLabel={
                  submitting
                    ? 'Saving...'
                    : editingActivity
                      ? 'Save Changes'
                      : 'Create Activity'
                }
              />
            </form>
          </Modal>
        )}
    </div>
  )
}

/*
 * REUSABLE COMPONENTS
 */

const inputClass =
  'w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary'

function ImageUploadField({
  id,
  label,
  preview,
  onChange,
  rounded = false,
}: {
  id: string
  label: string
  preview: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  rounded?: boolean
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-text-primary"
      >
        {label}
      </label>

      <label
        htmlFor={id}
        className="group block cursor-pointer overflow-hidden rounded-xl border border-dashed border-border-default bg-bg-base transition hover:border-brand-primary"
      >
        {preview ? (
          <div className="relative h-44 overflow-hidden">
            <img
              src={preview}
              alt={label}
              className={`h-full w-full object-cover ${rounded ? 'rounded-full' : ''
                }`}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-lg bg-bg-surface px-3 py-2 text-sm font-medium text-text-primary">
                <Upload className="h-4 w-4" />
                Change image
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-44 flex-col items-center justify-center px-6 text-center">
            <ImagePlus className="h-8 w-8 text-brand-primary" />
            <p className="mt-3 text-sm font-medium text-text-primary">
              Upload image
            </p>
            <p className="mt-1 text-xs text-text-muted">
              JPG, PNG, WEBP, or GIF. Maximum 5 MB.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Stored automatically up to 150 KB.
            </p>
          </div>
        )}
      </label>

      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onChange}
      />
    </div>
  )
}

function FormField({
  id,
  label,
  value,
  placeholder,
  type = 'text',
  onChange,
}: {
  id: string
  label: string
  value: string
  placeholder?: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-text-primary"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className={inputClass}
      />
    </div>
  )
}

function Modal({
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  title: string
  description: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-border-default bg-bg-surface shadow-2xl ${wide
          ? 'max-w-2xl'
          : 'max-w-lg'
          }`}
      >
        <div className="flex items-center justify-between border-b border-border-default px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-bold text-text-primary">
              {title}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

function ModalFooter({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void
  submitLabel: string
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-border-default px-6 py-5">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={
          submitLabel ===
          'Saving...'
        }
      >
        {submitLabel}
      </button>
    </div>
  )
}

function ErrorMessage({
  message,
}: {
  message: string
}) {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
  )
}

function EmptyTableRow({
  colSpan,
  message,
}: {
  colSpan: number
  message: string
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-16 text-center text-sm text-text-muted"
      >
        {message}
      </td>
    </tr>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-5">
      <div className="mb-3 text-brand-primary">
        {icon}
      </div>

      <p className="text-sm text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-text-primary">
        {value}
      </p>
    </div>
  )
}

function DetailCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-5">
      <p className="text-sm text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-text-primary">
        {value}
      </p>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: 'Active' | 'Inactive'
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${status === 'Active'
        ? 'bg-green-400/10 text-green-400'
        : 'bg-yellow-400/10 text-yellow-400'
        }`}
    >
      {status}
    </span>
  )
}

function ReleaseStatusBadge({
  status,
}: {
  status: 'Released' | 'Upcoming'
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${status === 'Released'
        ? 'bg-green-400/10 text-green-400'
        : 'bg-blue-400/10 text-blue-400'
        }`}
    >
      {status}
    </span>
  )
}

function MusicVideoStatusBadge({
  status,
}: {
  status: 'Published' | 'Upcoming'
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${status === 'Published'
        ? 'bg-green-400/10 text-green-400'
        : 'bg-blue-400/10 text-blue-400'
        }`}
    >
      {status}
    </span>
  )
}

function ActivityStatusBadge({
  status,
}: {
  status:
  | 'Upcoming'
  | 'Completed'
  | 'Cancelled'
}) {
  const className =
    status === 'Upcoming'
      ? 'bg-blue-400/10 text-blue-400'
      : status === 'Completed'
        ? 'bg-green-400/10 text-green-400'
        : 'bg-red-400/10 text-red-400'

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {status}
    </span>
  )
}