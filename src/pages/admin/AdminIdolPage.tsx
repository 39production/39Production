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

type AdminTheme = 'dark' | 'light'

interface ThemeTokens {
  page: string
  surface: string
  elevated: string
  input: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  hover: string
  placeholder: string
}

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

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_STORED_IMAGE_SIZE = 150 * 1024

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

function useAdminTheme() {
  const readTheme = (): AdminTheme =>
    document.documentElement.dataset.adminTheme === 'light'
      ? 'light'
      : 'dark'

  const [theme, setTheme] = useState<AdminTheme>(readTheme)

  useEffect(() => {
    const syncTheme = () => setTheme(readTheme())

    syncTheme()

    const observer = new MutationObserver(syncTheme)

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-admin-theme'],
    })

    return () => observer.disconnect()
  }, [])

  return theme
}

function getThemeTokens(theme: AdminTheme): ThemeTokens {
  if (theme === 'light') {
    return {
      page: 'bg-[#f7f7fa]',
      surface: 'bg-white',
      elevated: 'bg-neutral-50',
      input: 'bg-white',
      border: 'border-neutral-200',
      textPrimary: 'text-neutral-900',
      textSecondary: 'text-neutral-600',
      textMuted: 'text-neutral-500',
      hover: 'hover:bg-neutral-50',
      placeholder: 'placeholder:text-neutral-400',
    }
  }

  return {
    page: 'bg-[#0b0b0f]',
    surface: 'bg-[#15151b]',
    elevated: 'bg-[#1b1b22]',
    input: 'bg-[#0f0f13]',
    border: 'border-white/[0.08]',
    textPrimary: 'text-white',
    textSecondary: 'text-white/70',
    textMuted: 'text-white/45',
    hover: 'hover:bg-white/[0.04]',
    placeholder: 'placeholder:text-white/25',
  }
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
    const record =
      value as Record<string, unknown>

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

      if (
        typeof candidate === 'string' &&
        candidate.trim()
      ) {
        return candidate.trim()
      }
    }

    for (const key of [
      'data',
      'auth',
      'session',
      'user',
    ]) {
      const candidate = extractToken(
        record[key],
      )

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

    if (
      token &&
      !seen.has(token)
    ) {
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

  for (const storage of [
    window.localStorage,
    window.sessionStorage,
  ]) {
    for (const key of preferredKeys) {
      try {
        add(storage.getItem(key))
      } catch {
        // Ignore unavailable storage entries.
      }
    }

    try {
      for (
        let index = 0;
        index < storage.length;
        index += 1
      ) {
        const key = storage.key(index)

        if (
          key &&
          !preferredKeys.includes(key)
        ) {
          add(storage.getItem(key))
        }
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
      const response = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        },
      )

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

  const headers = new Headers(
    options?.headers,
  )

  headers.set(
    'Authorization',
    `Bearer ${token}`,
  )

  headers.set(
    'Accept',
    'application/json',
  )

  if (
    !(options?.body instanceof FormData)
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    )
  } else {
    headers.delete(
      'Content-Type',
    )
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

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
      `Request failed with status ${response.status}.`,
    )
  }

  return result.data
}

/*
 * NORMALIZERS
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
    stageName:
      member.stage_name ?? '',
    position:
      member.position ?? '',
    birthDate:
      member.birth_date ?? '',
    email: member.email ?? '',
    bio: member.bio ?? '',
    imageUrl:
      member.image_url ?? '',
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
    releaseDate:
      release.release_date ?? '',
    description:
      release.description ?? '',
    coverUrl:
      release.cover_url ?? '',
    audioUrl:
      release.audio_url ?? '',
    spotifyUrl:
      release.spotify_url ?? '',
    youtubeUrl:
      release.youtube_url ?? '',
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
          : activity.type ===
            'Schedule'
            ? 'Schedule'
            : 'Event',
    date: activity.date ?? '',
    location:
      activity.location ?? '',
    description:
      activity.description ?? '',
    imageUrl:
      activity.image_url ?? '',
    status:
      activity.status === 'Completed'
        ? 'Completed'
        : activity.status ===
          'Cancelled'
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
    description:
      video.description ?? '',
    thumbnailUrl:
      video.thumbnail_url ?? '',
    videoUrl:
      video.video_url ?? '',
    youtubeUrl:
      video.youtube_url ?? '',
    releaseDate:
      video.release_date ?? '',
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
    description:
      group.description ?? '',
    imageUrl:
      group.image_url ?? '',
    status:
      group.status === 'Hiatus'
        ? 'Hiatus'
        : 'Active',
    members: Array.isArray(
      group.members,
    )
      ? group.members.map(
        normalizeMember,
      )
      : [],
    releases: Array.isArray(
      group.releases,
    )
      ? group.releases.map(
        normalizeRelease,
      )
      : [],
    activities: Array.isArray(
      group.activities,
    )
      ? group.activities.map(
        normalizeActivity,
      )
      : [],
    musicVideos: Array.isArray(
      group.music_videos,
    )
      ? group.music_videos.map(
        normalizeMusicVideo,
      )
      : [],
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
      group.music_video_count ??
      0,
    ),
  }
}

function normalizeGroupList(
  group: any,
): IdolGroup {
  return {
    id: Number(group.id),
    name: group.name ?? '',
    description:
      group.description ?? '',
    imageUrl:
      group.image_url ?? '',
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
      group.music_video_count ??
      0,
    ),
  }
}

function formatDate(date: string) {
  if (!date) return '-'

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(
    new Date(`${date}T00:00:00`),
  )
}

/*
 * IMAGE UPLOAD
 */

async function compressIdolImage(
  file: File,
): Promise<File> {
  if (file.type === 'image/gif') {
    if (
      file.size >
      MAX_STORED_IMAGE_SIZE
    ) {
      throw new Error(
        'GIF image must not exceed 150 KB. Please use JPG, PNG, or WEBP for larger images.',
      )
    }

    return file
  }

  if (
    file.size <=
    MAX_STORED_IMAGE_SIZE &&
    file.type === 'image/webp'
  ) {
    return file
  }

  const bitmap =
    await createImageBitmap(file)

  const dimensions = [
    1200,
    1000,
    800,
    700,
    600,
    500,
    400,
  ]

  const qualities = [
    0.82,
    0.72,
    0.62,
    0.52,
    0.42,
    0.34,
    0.28,
  ]

  try {
    for (const maxDimension of dimensions) {
      const scale = Math.min(
        1,
        maxDimension /
        Math.max(
          bitmap.width,
          bitmap.height,
        ),
      )

      const width = Math.max(
        1,
        Math.round(
          bitmap.width * scale,
        ),
      )

      const height = Math.max(
        1,
        Math.round(
          bitmap.height * scale,
        ),
      )

      const canvas =
        document.createElement(
          'canvas',
        )

      canvas.width = width
      canvas.height = height

      const context =
        canvas.getContext('2d')

      if (!context) {
        throw new Error(
          'Your browser cannot process the idol image.',
        )
      }

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality =
        'high'

      context.drawImage(
        bitmap,
        0,
        0,
        width,
        height,
      )

      for (const quality of qualities) {
        const blob =
          await new Promise<Blob | null>(
            (resolve) =>
              canvas.toBlob(
                resolve,
                'image/webp',
                quality,
              ),
          )

        if (
          blob &&
          blob.size <=
          MAX_STORED_IMAGE_SIZE
        ) {
          return new File(
            [blob],
            `${file.name.replace(/\.[^.]+$/, '')}.webp`,
            {
              type: 'image/webp',
              lastModified:
                Date.now(),
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

function validateIdolImageFile(
  file: File,
) {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type,
    )
  ) {
    throw new Error(
      'Image must be JPG, PNG, WEBP, or GIF.',
    )
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      'Image size must not exceed 5 MB.',
    )
  }
}

function handleIdolImageChange(
  event: React.ChangeEvent<HTMLInputElement>,
  setFile: (file: File | null) => void,
  setPreview: (preview: string) => void,
  setError: (message: string) => void,
) {
  const file =
    event.target.files?.[0]

  event.target.value = ''

  if (!file) return

  try {
    validateIdolImageFile(file)
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Invalid image file.',
    )
    return
  }

  setFile(file)
  setPreview(
    URL.createObjectURL(file),
  )
}

/*
 * PAGE
 */

export function AdminIdolPage() {
  const theme = useAdminTheme()
  const c = getThemeTokens(theme)

  const [groups, setGroups] =
    useState<IdolGroup[]>([])

  const [
    selectedGroupId,
    setSelectedGroupId,
  ] = useState<number | null>(null)

  const [search, setSearch] =
    useState('')

  const [
    isGroupModalOpen,
    setIsGroupModalOpen,
  ] = useState(false)

  const [
    isMemberModalOpen,
    setIsMemberModalOpen,
  ] = useState(false)

  const [
    isReleaseModalOpen,
    setIsReleaseModalOpen,
  ] = useState(false)

  const [
    isActivityModalOpen,
    setIsActivityModalOpen,
  ] = useState(false)

  const [
    isMusicVideoModalOpen,
    setIsMusicVideoModalOpen,
  ] = useState(false)

  const [
    editingGroup,
    setEditingGroup,
  ] = useState<IdolGroup | null>(null)

  const [
    editingMember,
    setEditingMember,
  ] = useState<IdolMember | null>(null)

  const [
    editingRelease,
    setEditingRelease,
  ] = useState<IdolRelease | null>(null)

  const [
    editingActivity,
    setEditingActivity,
  ] = useState<IdolActivity | null>(
    null,
  )

  const [
    editingMusicVideo,
    setEditingMusicVideo,
  ] =
    useState<IdolMusicVideo | null>(
      null,
    )

  const [groupForm, setGroupForm] =
    useState({
      ...emptyGroupForm,
    })

  const [memberForm, setMemberForm] =
    useState({
      ...emptyMemberForm,
    })

  const [releaseForm, setReleaseForm] =
    useState({
      ...emptyReleaseForm,
    })

  const [
    activityForm,
    setActivityForm,
  ] = useState({
    ...emptyActivityForm,
  })

  const [
    musicVideoForm,
    setMusicVideoForm,
  ] = useState({
    ...emptyMusicVideoForm,
  })

  const [
    groupImageFile,
    setGroupImageFile,
  ] = useState<File | null>(null)

  const [
    groupImagePreview,
    setGroupImagePreview,
  ] = useState('')

  const [
    memberImageFile,
    setMemberImageFile,
  ] = useState<File | null>(null)

  const [
    memberImagePreview,
    setMemberImagePreview,
  ] = useState('')

  const [
    releaseImageFile,
    setReleaseImageFile,
  ] = useState<File | null>(null)

  const [
    releaseImagePreview,
    setReleaseImagePreview,
  ] = useState('')

  const [
    activityImageFile,
    setActivityImageFile,
  ] = useState<File | null>(null)

  const [
    activityImagePreview,
    setActivityImagePreview,
  ] = useState('')

  const [
    musicVideoImageFile,
    setMusicVideoImageFile,
  ] = useState<File | null>(null)

  const [
    musicVideoImagePreview,
    setMusicVideoImagePreview,
  ] = useState('')

  const [error, setError] =
    useState('')

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

      const data = await apiRequest<
        any[]
      >('/api/idol/groups')

      setGroups(
        Array.isArray(data)
          ? data.map(
            normalizeGroupList,
          )
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

  async function loadGroupDetail(
    groupId: number,
  ) {
    try {
      setError('')

      const data =
        await apiRequest<any>(
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
    if (
      selectedGroupId !== null
    ) {
      loadGroupDetail(
        selectedGroupId,
      )
    }
  }, [selectedGroupId])

  const selectedGroup =
    groups.find(
      (group) =>
        group.id ===
        selectedGroupId,
    )

  const filteredGroups = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim()

    return groups.filter((group) =>
      group.name
        .toLowerCase()
        .includes(searchValue),
    )
  }, [groups, search])

  const totalMembers =
    groups.reduce(
      (total, group) =>
        total + group.memberCount,
      0,
    )

  const upcomingEvents =
    groups.reduce(
      (total, group) =>
        total +
        group.activityCount,
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
      description:
        group.description,
      imageUrl: group.imageUrl,
      status: group.status,
    })

    setGroupImageFile(null)
    setGroupImagePreview(
      group.imageUrl || '',
    )

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

    const name =
      groupForm.name.trim()

    const description =
      groupForm.description.trim()

    if (!name) {
      setError(
        'Group name is required.',
      )
      return
    }

    const duplicateName =
      groups.some(
        (group) =>
          group.name
            .toLowerCase() ===
          name.toLowerCase() &&
          group.id !==
          editingGroup?.id,
      )

    if (duplicateName) {
      setError(
        'A group with this name already exists.',
      )
      return
    }

    try {
      setSubmitting(true)

      const formData =
        new FormData()

      formData.append(
        'name',
        name,
      )

      formData.append(
        'description',
        description,
      )

      formData.append(
        'status',
        groupForm.status,
      )

      if (groupImageFile) {
        const compressedImage =
          await compressIdolImage(
            groupImageFile,
          )

        formData.append(
          'image',
          compressedImage,
        )
      }

      const endpoint =
        editingGroup
          ? `/api/idol/groups/${editingGroup.id}`
          : '/api/idol/groups'

      await apiRequest(
        endpoint,
        {
          method: editingGroup
            ? 'PUT'
            : 'POST',
          body: formData,
        },
      )

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
    const group =
      groups.find(
        (item) => item.id === id,
      )

    if (!group) return

    const confirmed =
      window.confirm(
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

      if (
        selectedGroupId === id
      ) {
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
      stageName:
        member.stageName,
      position:
        member.position,
      birthDate:
        member.birthDate,
      email: member.email,
      bio: member.bio,
      imageUrl:
        member.imageUrl,
      status: member.status,
    })

    setMemberImageFile(null)
    setMemberImagePreview(
      member.imageUrl || '',
    )

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
      setError(
        'Please select a group first.',
      )
      return
    }

    const name =
      memberForm.name.trim()

    const stageName =
      memberForm.stageName.trim()

    const position =
      memberForm.position.trim()

    const email =
      memberForm.email
        .trim()
        .toLowerCase()

    const bio =
      memberForm.bio.trim()

    if (!name) {
      setError(
        'Member name is required.',
      )
      return
    }

    if (!stageName) {
      setError(
        'Stage name is required.',
      )
      return
    }

    if (!position) {
      setError(
        'Position is required.',
      )
      return
    }

    if (!memberForm.birthDate) {
      setError(
        'Birth date is required.',
      )
      return
    }

    if (!email) {
      setError(
        'Email is required.',
      )
      return
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      setError(
        'Please enter a valid email.',
      )
      return
    }

    const duplicateStageName =
      selectedGroup.members.some(
        (member) =>
          member.stageName
            .toLowerCase() ===
          stageName.toLowerCase() &&
          member.id !==
          editingMember?.id,
      )

    if (duplicateStageName) {
      setError(
        'A member with this stage name already exists in this group.',
      )
      return
    }

    try {
      setSubmitting(true)

      const formData =
        new FormData()

      formData.append(
        'name',
        name,
      )

      formData.append(
        'stage_name',
        stageName,
      )

      formData.append(
        'position',
        position,
      )

      formData.append(
        'birth_date',
        memberForm.birthDate,
      )

      formData.append(
        'email',
        email,
      )

      formData.append(
        'bio',
        bio,
      )

      formData.append(
        'status',
        memberForm.status,
      )

      if (memberImageFile) {
        const compressedImage =
          await compressIdolImage(
            memberImageFile,
          )

        formData.append(
          'image',
          compressedImage,
        )
      }

      const endpoint =
        editingMember
          ? `/api/idol/members/${editingMember.id}`
          : `/api/idol/groups/${selectedGroup.id}/members`

      await apiRequest(
        endpoint,
        {
          method: editingMember
            ? 'PUT'
            : 'POST',
          body: formData,
        },
      )

      closeMemberModal()

      await loadGroupDetail(
        selectedGroup.id,
      )

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

    const confirmed =
      window.confirm(
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
      releaseDate:
        release.releaseDate,
      description:
        release.description,
      coverUrl:
        release.coverUrl,
      audioUrl:
        release.audioUrl,
      spotifyUrl:
        release.spotifyUrl,
      youtubeUrl:
        release.youtubeUrl,
      status: release.status,
    })

    setReleaseImageFile(null)
    setReleaseImagePreview(
      release.coverUrl || '',
    )

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
      setError(
        'Please select a group first.',
      )
      return
    }

    const title =
      releaseForm.title.trim()

    const description =
      releaseForm.description.trim()

    const audioUrl =
      releaseForm.audioUrl.trim()

    const spotifyUrl =
      releaseForm.spotifyUrl.trim()

    const youtubeUrl =
      releaseForm.youtubeUrl.trim()

    if (!title) {
      setError(
        'Release title is required.',
      )
      return
    }

    if (!releaseForm.releaseDate) {
      setError(
        'Release date is required.',
      )
      return
    }

    if (!description) {
      setError(
        'Release description is required.',
      )
      return
    }

    try {
      setSubmitting(true)

      const formData =
        new FormData()

      formData.append(
        'title',
        title,
      )

      formData.append(
        'type',
        releaseForm.type,
      )

      formData.append(
        'release_date',
        releaseForm.releaseDate,
      )

      formData.append(
        'description',
        description,
      )

      formData.append(
        'audio_url',
        audioUrl,
      )

      formData.append(
        'spotify_url',
        spotifyUrl,
      )

      formData.append(
        'youtube_url',
        youtubeUrl,
      )

      formData.append(
        'status',
        releaseForm.status,
      )

      if (releaseImageFile) {
        const compressedImage =
          await compressIdolImage(
            releaseImageFile,
          )

        formData.append(
          'image',
          compressedImage,
        )
      }

      const endpoint =
        editingRelease
          ? `/api/idol/releases/${editingRelease.id}`
          : `/api/idol/groups/${selectedGroup.id}/releases`

      await apiRequest(
        endpoint,
        {
          method: editingRelease
            ? 'PUT'
            : 'POST',
          body: formData,
        },
      )

      closeReleaseModal()

      await loadGroupDetail(
        selectedGroup.id,
      )

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

    const confirmed =
      window.confirm(
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
      location:
        activity.location,
      description:
        activity.description,
      imageUrl:
        activity.imageUrl,
      status: activity.status,
    })

    setActivityImageFile(null)
    setActivityImagePreview(
      activity.imageUrl || '',
    )

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
      setError(
        'Please select a group first.',
      )
      return
    }

    const title =
      activityForm.title.trim()

    const location =
      activityForm.location.trim()

    const description =
      activityForm.description.trim()

    if (!title) {
      setError(
        'Activity title is required.',
      )
      return
    }

    if (!activityForm.date) {
      setError(
        'Activity date is required.',
      )
      return
    }

    if (!location) {
      setError(
        'Location is required.',
      )
      return
    }

    if (!description) {
      setError(
        'Activity description is required.',
      )
      return
    }

    try {
      setSubmitting(true)

      const formData =
        new FormData()

      formData.append(
        'title',
        title,
      )

      formData.append(
        'type',
        activityForm.type,
      )

      formData.append(
        'date',
        activityForm.date,
      )

      formData.append(
        'location',
        location,
      )

      formData.append(
        'description',
        description,
      )

      formData.append(
        'status',
        activityForm.status,
      )

      if (activityImageFile) {
        const compressedImage =
          await compressIdolImage(
            activityImageFile,
          )

        formData.append(
          'image',
          compressedImage,
        )
      }

      const endpoint =
        editingActivity
          ? `/api/idol/activities/${editingActivity.id}`
          : `/api/idol/groups/${selectedGroup.id}/activities`

      await apiRequest(
        endpoint,
        {
          method: editingActivity
            ? 'PUT'
            : 'POST',
          body: formData,
        },
      )

      closeActivityModal()

      await loadGroupDetail(
        selectedGroup.id,
      )

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

    const confirmed =
      window.confirm(
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
      description:
        video.description,
      thumbnailUrl:
        video.thumbnailUrl,
      videoUrl:
        video.videoUrl,
      youtubeUrl:
        video.youtubeUrl,
      releaseDate:
        video.releaseDate,
      releaseId:
        video.releaseId !== null &&
          video.releaseId !== undefined
          ? String(video.releaseId)
          : '',
      status: video.status,
    })

    setMusicVideoImageFile(null)
    setMusicVideoImagePreview(
      video.thumbnailUrl || '',
    )

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
      setError(
        'Please select a group first.',
      )
      return
    }

    const title =
      musicVideoForm.title.trim()

    const description =
      musicVideoForm.description.trim()

    const videoUrl =
      musicVideoForm.videoUrl.trim()

    const youtubeUrl =
      musicVideoForm.youtubeUrl.trim()

    if (!title) {
      setError(
        'Music video title is required.',
      )
      return
    }

    if (!description) {
      setError(
        'Music video description is required.',
      )
      return
    }

    if (!videoUrl && !youtubeUrl) {
      setError(
        'Please enter a video URL or YouTube URL.',
      )
      return
    }

    try {
      setSubmitting(true)

      const formData =
        new FormData()

      formData.append(
        'group_id',
        String(selectedGroup.id),
      )

      formData.append(
        'release_id',
        musicVideoForm.releaseId
          ? String(
            Number(
              musicVideoForm.releaseId,
            ),
          )
          : '',
      )

      formData.append(
        'title',
        title,
      )

      formData.append(
        'description',
        description,
      )

      formData.append(
        'video_url',
        videoUrl,
      )

      formData.append(
        'youtube_url',
        youtubeUrl,
      )

      formData.append(
        'release_date',
        musicVideoForm.releaseDate,
      )

      formData.append(
        'status',
        musicVideoForm.status,
      )

      if (musicVideoImageFile) {
        const compressedImage =
          await compressIdolImage(
            musicVideoImageFile,
          )

        formData.append(
          'image',
          compressedImage,
        )
      }

      const endpoint =
        editingMusicVideo
          ? `/api/idol/music-videos/${editingMusicVideo.id}`
          : '/api/idol/music-videos'

      await apiRequest(
        endpoint,
        {
          method:
            editingMusicVideo
              ? 'PUT'
              : 'POST',
          body: formData,
        },
      )

      closeMusicVideoModal()

      await loadGroupDetail(
        selectedGroup.id,
      )
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

    const confirmed =
      window.confirm(
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

    await loadGroupDetail(
      groupId,
    )
  }

  function backToGroups() {
    setSelectedGroupId(null)
    setSearch('')
    setError('')
  }

  const showGlobalError =
    error &&
    !isGroupModalOpen &&
    !isMemberModalOpen &&
    !isReleaseModalOpen &&
    !isActivityModalOpen &&
    !isMusicVideoModalOpen

  /*
   * RENDER
   */

  return (
    <div
      className={`min-h-full space-y-8 ${c.page}`}
    >
      <div>
        <p
          className={`text-sm ${c.textMuted}`}
        >
          Admin Panel
        </p>

        <h1
          className={`mt-1 text-3xl font-bold ${c.textPrimary}`}
        >
          Idol Production
        </h1>

        <p
          className={`mt-2 text-sm ${c.textSecondary}`}
        >
          Manage idol groups, members,
          releases, music videos, and
          activities.
        </p>
      </div>

      {showGlobalError && (
        <ErrorMessage
          message={error}
          theme={theme}
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat
          icon={
            <Music className="h-5 w-5" />
          }
          label="Groups"
          value={String(
            groups.length,
          )}
          theme={theme}
        />

        <Stat
          icon={
            <Users className="h-5 w-5" />
          }
          label="Members"
          value={String(
            totalMembers,
          )}
          theme={theme}
        />

        <Stat
          icon={
            <CalendarDays className="h-5 w-5" />
          }
          label="Upcoming Events"
          value={String(
            upcomingEvents,
          )}
          theme={theme}
        />
      </div>

      {loading && (
        <div
          className={`rounded-xl border ${c.border} ${c.surface} px-6 py-16 text-center`}
        >
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />

          <p
            className={`mt-4 text-sm ${c.textMuted}`}
          >
            Loading idol production
            data...
          </p>
        </div>
      )}

      {!loading &&
        !selectedGroup && (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2
                  className={`text-xl font-bold ${c.textPrimary}`}
                >
                  Idol Groups
                </h2>

                <p
                  className={`mt-1 text-sm ${c.textMuted}`}
                >
                  Select a group to manage its
                  production data.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  openAddGroupModal
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
                Add Group
              </button>
            </div>

            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${c.textMuted}`}
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search groups..."
                className={`w-full rounded-lg border ${c.border} ${c.surface} ${c.textPrimary} ${c.placeholder} py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10`}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map(
                (group) => (
                  <div
                    key={group.id}
                    className={`overflow-hidden rounded-xl border ${c.border} ${c.surface}`}
                  >
                    {group.imageUrl ? (
                      <div className="h-40 overflow-hidden bg-neutral-100 dark:bg-black">
                        <img
                          src={
                            group.imageUrl
                          }
                          alt={group.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`flex h-40 items-center justify-center ${c.input}`}
                      >
                        <Music className="h-10 w-10 text-violet-500" />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div className="rounded-xl bg-violet-500/10 p-3 text-violet-500">
                          <Music className="h-6 w-6" />
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${group.status ===
                              'Active'
                              ? theme ===
                                'light'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-emerald-500/10 text-emerald-400'
                              : theme ===
                                'light'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                        >
                          {group.status}
                        </span>
                      </div>

                      <h2
                        className={`mt-5 text-xl font-bold ${c.textPrimary}`}
                      >
                        {group.name}
                      </h2>

                      {group.description && (
                        <p
                          className={`mt-2 line-clamp-2 text-sm ${c.textMuted}`}
                        >
                          {
                            group.description
                          }
                        </p>
                      )}

                      <div
                        className={`mt-5 space-y-3 text-sm ${c.textSecondary}`}
                      >
                        <div className="flex justify-between">
                          <span>
                            Members
                          </span>

                          <span>
                            {
                              group.memberCount
                            }
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>
                            Releases
                          </span>

                          <span>
                            {
                              group.releaseCount
                            }
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>
                            Activities
                          </span>

                          <span>
                            {
                              group.activityCount
                            }
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
                          className={`inline-flex items-center justify-center gap-2 rounded-lg border ${c.border} py-2.5 text-sm ${c.textSecondary} ${c.hover} transition`}
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
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
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
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-red-500 transition hover:bg-red-500/10"
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
                  <div
                    className={`rounded-xl border ${c.border} ${c.surface} px-6 py-16 text-center md:col-span-2 lg:col-span-3`}
                  >
                    <Music
                      className={`mx-auto h-10 w-10 ${c.textMuted}`}
                    />

                    <p
                      className={`mt-4 text-sm ${c.textMuted}`}
                    >
                      No idol groups
                      found.
                    </p>
                  </div>
                )}
            </div>
          </>
        )}

      {!loading &&
        selectedGroup && (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={
                    backToGroups
                  }
                  className={`rounded-lg border ${c.border} p-2.5 ${c.textMuted} ${c.hover} transition`}
                  title="Back to groups"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div>
                  <p
                    className={`text-sm ${c.textMuted}`}
                  >
                    Idol Group
                  </p>

                  <h2
                    className={`text-2xl font-bold ${c.textPrimary}`}
                  >
                    {
                      selectedGroup.name
                    }
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
                  className={`inline-flex items-center gap-2 rounded-lg border ${c.border} px-4 py-2.5 text-sm ${c.textSecondary} ${c.hover} transition`}
                >
                  <Edit className="h-4 w-4" />
                  Edit Group
                </button>

                <button
                  type="button"
                  onClick={
                    openAddMemberModal
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </button>
              </div>
            </div>

            {(selectedGroup.imageUrl ||
              selectedGroup.description) && (
                <div
                  className={`overflow-hidden rounded-xl border ${c.border} ${c.surface}`}
                >
                  {selectedGroup.imageUrl && (
                    <div className="h-56 overflow-hidden">
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
                      <p
                        className={`text-sm leading-7 ${c.textSecondary}`}
                      >
                        {
                          selectedGroup.description
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

            <div className="grid gap-4 md:grid-cols-5">
              <DetailCard
                label="Status"
                value={
                  selectedGroup.status
                }
                theme={theme}
              />

              <DetailCard
                label="Members"
                value={String(
                  selectedGroup
                    .members
                    .length,
                )}
                theme={theme}
              />

              <DetailCard
                label="Releases"
                value={String(
                  selectedGroup
                    .releases
                    .length,
                )}
                theme={theme}
              />

              <DetailCard
                label="Music Videos"
                value={String(
                  selectedGroup
                    .musicVideos
                    .length,
                )}
                theme={theme}
              />

              <DetailCard
                label="Activities"
                value={String(
                  selectedGroup
                    .activities
                    .length,
                )}
                theme={theme}
              />
            </div>

            {/* MEMBERS */}

            <DataSection
              title="Group Members"
              description={`Manage members of ${selectedGroup.name}.`}
              actionLabel="Add Member"
              onAction={
                openAddMemberModal
              }
              theme={theme}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr
                      className={`border-b ${c.border} ${c.elevated}`}
                    >
                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Member
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Position
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Birth Date
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Email
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Status
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedGroup.members.map(
                      (member) => (
                        <tr
                          key={member.id}
                          className={`border-b ${c.border} last:border-0 ${c.hover} transition`}
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
                                <div className="rounded-full bg-violet-500/10 p-2.5 text-violet-500">
                                  <User className="h-5 w-5" />
                                </div>
                              )}

                              <div>
                                <p
                                  className={`font-medium ${c.textPrimary}`}
                                >
                                  {
                                    member.stageName
                                  }
                                </p>

                                <p
                                  className={`text-xs ${c.textMuted}`}
                                >
                                  {
                                    member.name
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td
                            className={`px-6 py-4 ${c.textSecondary}`}
                          >
                            {
                              member.position
                            }
                          </td>

                          <td
                            className={`px-6 py-4 ${c.textSecondary}`}
                          >
                            {formatDate(
                              member.birthDate,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div
                              className={`flex items-center gap-2 ${c.textSecondary}`}
                            >
                              <Mail className="h-4 w-4" />
                              {
                                member.email
                              }
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <StatusBadge
                              status={
                                member.status
                              }
                              theme={
                                theme
                              }
                            />
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <IconButton
                                title="Edit member"
                                onClick={() =>
                                  openEditMemberModal(
                                    member,
                                  )
                                }
                                theme={
                                  theme
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </IconButton>

                              <DeleteButton
                                title="Delete member"
                                onClick={() =>
                                  handleDeleteMember(
                                    member.id,
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ),
                    )}

                    {selectedGroup
                      .members
                      .length ===
                      0 && (
                        <EmptyTableRow
                          colSpan={6}
                          message="This group has no members yet."
                          theme={theme}
                        />
                      )}
                  </tbody>
                </table>
              </div>
            </DataSection>

            {/* RELEASES */}

            <DataSection
              title="Releases"
              description={`Manage releases from ${selectedGroup.name}.`}
              actionLabel="Add Release"
              onAction={
                openAddReleaseModal
              }
              theme={theme}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead>
                    <tr
                      className={`border-b ${c.border} ${c.elevated}`}
                    >
                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Release
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Type
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Release Date
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Media
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Status
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedGroup.releases.map(
                      (release) => (
                        <tr
                          key={release.id}
                          className={`border-b ${c.border} last:border-0 ${c.hover} transition`}
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
                                <div className="rounded-lg bg-violet-500/10 p-3 text-violet-500">
                                  <Music className="h-5 w-5" />
                                </div>
                              )}

                              <div>
                                <p
                                  className={`font-medium ${c.textPrimary}`}
                                >
                                  {
                                    release.title
                                  }
                                </p>

                                <p
                                  className={`mt-1 max-w-md text-xs ${c.textMuted}`}
                                >
                                  {
                                    release.description
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full ${c.elevated} px-3 py-1 text-xs ${c.textSecondary}`}
                            >
                              {
                                release.type
                              }
                            </span>
                          </td>

                          <td
                            className={`px-6 py-4 ${c.textSecondary}`}
                          >
                            {formatDate(
                              release.releaseDate,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {release.audioUrl && (
                                <span
                                  title="Audio URL available"
                                  className="rounded-lg bg-violet-500/10 p-2 text-violet-500"
                                >
                                  <Play className="h-4 w-4" />
                                </span>
                              )}

                              {release.spotifyUrl && (
                                <span
                                  title="Spotify URL available"
                                  className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500"
                                >
                                  <LinkIcon className="h-4 w-4" />
                                </span>
                              )}

                              {release.youtubeUrl && (
                                <span
                                  title="YouTube URL available"
                                  className="rounded-lg bg-red-500/10 p-2 text-red-500"
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
                              theme={
                                theme
                              }
                            />
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <IconButton
                                title="Edit release"
                                onClick={() =>
                                  openEditReleaseModal(
                                    release,
                                  )
                                }
                                theme={
                                  theme
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </IconButton>

                              <DeleteButton
                                title="Delete release"
                                onClick={() =>
                                  handleDeleteRelease(
                                    release.id,
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ),
                    )}

                    {selectedGroup
                      .releases
                      .length ===
                      0 && (
                        <EmptyTableRow
                          colSpan={6}
                          message="This group has no releases yet."
                          theme={theme}
                        />
                      )}
                  </tbody>
                </table>
              </div>
            </DataSection>

            {/* MUSIC VIDEOS */}

            <DataSection
              title="Music Videos"
              description={`Manage music videos for ${selectedGroup.name}.`}
              actionLabel="Add Music Video"
              onAction={
                openAddMusicVideoModal
              }
              theme={theme}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead>
                    <tr
                      className={`border-b ${c.border} ${c.elevated}`}
                    >
                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Video
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Release Date
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Media
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Status
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedGroup.musicVideos.map(
                      (video) => (
                        <tr
                          key={video.id}
                          className={`border-b ${c.border} last:border-0 ${c.hover} transition`}
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
                                <div
                                  className={`flex h-14 w-24 items-center justify-center rounded-lg ${c.input} text-violet-500`}
                                >
                                  <Play className="h-5 w-5" />
                                </div>
                              )}

                              <div>
                                <p
                                  className={`font-medium ${c.textPrimary}`}
                                >
                                  {
                                    video.title
                                  }
                                </p>

                                <p
                                  className={`mt-1 max-w-md text-xs ${c.textMuted}`}
                                >
                                  {
                                    video.description
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td
                            className={`px-6 py-4 ${c.textSecondary}`}
                          >
                            {formatDate(
                              video.releaseDate,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {video.videoUrl && (
                                <span
                                  className="rounded-lg bg-violet-500/10 p-2 text-violet-500"
                                  title="Direct video URL"
                                >
                                  <Play className="h-4 w-4" />
                                </span>
                              )}

                              {video.youtubeUrl && (
                                <span
                                  className="rounded-lg bg-red-500/10 p-2 text-red-500"
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
                              theme={
                                theme
                              }
                            />
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <IconButton
                                title="Edit music video"
                                onClick={() =>
                                  openEditMusicVideoModal(
                                    video,
                                  )
                                }
                                theme={
                                  theme
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </IconButton>

                              <DeleteButton
                                title="Delete music video"
                                onClick={() =>
                                  handleDeleteMusicVideo(
                                    video.id,
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ),
                    )}

                    {selectedGroup
                      .musicVideos
                      .length ===
                      0 && (
                        <EmptyTableRow
                          colSpan={5}
                          message="This group has no music videos yet."
                          theme={theme}
                        />
                      )}
                  </tbody>
                </table>
              </div>
            </DataSection>

            {/* ACTIVITIES */}

            <DataSection
              title="Activities"
              description={`Manage events and activities for ${selectedGroup.name}.`}
              actionLabel="Add Activity"
              onAction={
                openAddActivityModal
              }
              theme={theme}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead>
                    <tr
                      className={`border-b ${c.border} ${c.elevated}`}
                    >
                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Activity
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Type
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Date
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Location
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Status
                      </th>

                      <th className={`px-6 py-4 font-semibold ${c.textPrimary}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedGroup.activities.map(
                      (activity) => (
                        <tr
                          key={activity.id}
                          className={`border-b ${c.border} last:border-0 ${c.hover} transition`}
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
                                <div className="rounded-lg bg-violet-500/10 p-3 text-violet-500">
                                  <CalendarDays className="h-5 w-5" />
                                </div>
                              )}

                              <div>
                                <p
                                  className={`font-medium ${c.textPrimary}`}
                                >
                                  {
                                    activity.title
                                  }
                                </p>

                                <p
                                  className={`mt-1 max-w-md text-xs ${c.textMuted}`}
                                >
                                  {
                                    activity.description
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full ${c.elevated} px-3 py-1 text-xs ${c.textSecondary}`}
                            >
                              {
                                activity.type
                              }
                            </span>
                          </td>

                          <td
                            className={`px-6 py-4 ${c.textSecondary}`}
                          >
                            {formatDate(
                              activity.date,
                            )}
                          </td>

                          <td
                            className={`px-6 py-4 ${c.textSecondary}`}
                          >
                            {
                              activity.location
                            }
                          </td>

                          <td className="px-6 py-4">
                            <ActivityStatusBadge
                              status={
                                activity.status
                              }
                              theme={
                                theme
                              }
                            />
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <IconButton
                                title="Edit activity"
                                onClick={() =>
                                  openEditActivityModal(
                                    activity,
                                  )
                                }
                                theme={
                                  theme
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </IconButton>

                              <DeleteButton
                                title="Delete activity"
                                onClick={() =>
                                  handleDeleteActivity(
                                    activity.id,
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ),
                    )}

                    {selectedGroup
                      .activities
                      .length ===
                      0 && (
                        <EmptyTableRow
                          colSpan={6}
                          message="This group has no activities yet."
                          theme={theme}
                        />
                      )}
                  </tbody>
                </table>
              </div>
            </DataSection>
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
          onClose={
            closeGroupModal
          }
          theme={theme}
        >
          <form
            onSubmit={
              handleGroupSubmit
            }
          >
            <div className="space-y-5 px-6 py-6">
              {error && (
                <ErrorMessage
                  message={error}
                  theme={theme}
                />
              )}

              <FormField
                id="group-name"
                label="Group Name"
                value={
                  groupForm.name
                }
                placeholder="e.g. LUMINA"
                onChange={(value) =>
                  setGroupForm(
                    (current) => ({
                      ...current,
                      name: value,
                    }),
                  )
                }
                theme={theme}
              />

              <div>
                <label
                  htmlFor="group-description"
                  className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
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
                  className={`${getInputClass(
                    theme,
                  )} resize-none`}
                />
              </div>

              <ImageUploadField
                id="group-image"
                label="Group Image"
                preview={
                  groupImagePreview
                }
                onChange={(event) =>
                  handleIdolImageChange(
                    event,
                    setGroupImageFile,
                    setGroupImagePreview,
                    setError,
                  )
                }
                theme={theme}
              />

              <div>
                <label
                  htmlFor="group-status"
                  className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
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
                  className={getInputClass(
                    theme,
                  )}
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
              onCancel={
                closeGroupModal
              }
              submitLabel={
                submitting
                  ? 'Saving...'
                  : editingGroup
                    ? 'Save Changes'
                    : 'Create Group'
              }
              theme={theme}
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
            onClose={
              closeMemberModal
            }
            wide
            theme={theme}
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
                    theme={theme}
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
                    theme={theme}
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
                    theme={theme}
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
                  theme={theme}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="member-birth-date"
                      className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                    >
                      Birth Date
                    </label>

                    <input
                      id="member-birth-date"
                      type="date"
                      value={
                        memberForm.birthDate
                      }
                      onChange={(
                        event,
                      ) =>
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
                      className={getInputClass(
                        theme,
                      )}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="member-status"
                      className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                    >
                      Status
                    </label>

                    <select
                      id="member-status"
                      value={
                        memberForm.status
                      }
                      onChange={(
                        event,
                      ) =>
                        setMemberForm(
                          (current) => ({
                            ...current,
                            status:
                              event.target
                                .value as
                              | 'Active'
                              | 'Inactive',
                          }),
                        )
                      }
                      className={getInputClass(
                        theme,
                      )}
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
                  theme={theme}
                />

                <ImageUploadField
                  id="member-image"
                  label="Member Image"
                  preview={
                    memberImagePreview
                  }
                  rounded
                  onChange={(event) =>
                    handleIdolImageChange(
                      event,
                      setMemberImageFile,
                      setMemberImagePreview,
                      setError,
                    )
                  }
                  theme={theme}
                />

                <div>
                  <label
                    htmlFor="member-bio"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
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
                    className={`${getInputClass(
                      theme,
                    )} resize-none`}
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
                theme={theme}
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
            theme={theme}
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
                    theme={theme}
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
                  theme={theme}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="release-type"
                      className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                    >
                      Release Type
                    </label>

                    <select
                      id="release-type"
                      value={
                        releaseForm.type
                      }
                      onChange={(
                        event,
                      ) =>
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
                      className={getInputClass(
                        theme,
                      )}
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
                      className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                    >
                      Release Date
                    </label>

                    <input
                      id="release-date"
                      type="date"
                      value={
                        releaseForm.releaseDate
                      }
                      onChange={(
                        event,
                      ) =>
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
                      className={getInputClass(
                        theme,
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="release-description"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                  >
                    Description
                  </label>

                  <textarea
                    id="release-description"
                    rows={4}
                    value={
                      releaseForm.description
                    }
                    onChange={(
                      event,
                    ) =>
                      setReleaseForm(
                        (current) => ({
                          ...current,
                          description:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="Describe this release..."
                    className={`${getInputClass(
                      theme,
                    )} resize-none`}
                  />
                </div>

                <ImageUploadField
                  id="release-cover-image"
                  label="Cover Image"
                  preview={
                    releaseImagePreview
                  }
                  onChange={(event) =>
                    handleIdolImageChange(
                      event,
                      setReleaseImageFile,
                      setReleaseImagePreview,
                      setError,
                    )
                  }
                  theme={theme}
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
                  theme={theme}
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
                    theme={theme}
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
                    theme={theme}
                  />
                </div>

                <div>
                  <label
                    htmlFor="release-status"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
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
                            event.target
                              .value as
                            | 'Released'
                            | 'Upcoming',
                        }),
                      )
                    }
                    className={getInputClass(
                      theme,
                    )}
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
                theme={theme}
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
            theme={theme}
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
                    theme={theme}
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
                  theme={theme}
                />

                <div>
                  <label
                    htmlFor="music-video-description"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
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
                    className={`${getInputClass(
                      theme,
                    )} resize-none`}
                  />
                </div>

                <ImageUploadField
                  id="music-video-thumbnail-image"
                  label="Thumbnail Image"
                  preview={
                    musicVideoImagePreview
                  }
                  onChange={(event) =>
                    handleIdolImageChange(
                      event,
                      setMusicVideoImageFile,
                      setMusicVideoImagePreview,
                      setError,
                    )
                  }
                  theme={theme}
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
                    theme={theme}
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
                    theme={theme}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="music-video-release"
                      className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                    >
                      Related Release
                    </label>

                    <select
                      id="music-video-release"
                      value={
                        musicVideoForm.releaseId
                      }
                      onChange={(
                        event,
                      ) =>
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
                      className={getInputClass(
                        theme,
                      )}
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
                      className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                    >
                      Release Date
                    </label>

                    <input
                      id="music-video-date"
                      type="date"
                      value={
                        musicVideoForm.releaseDate
                      }
                      onChange={(
                        event,
                      ) =>
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
                      className={getInputClass(
                        theme,
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="music-video-status"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
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
                            event.target
                              .value as
                            | 'Published'
                            | 'Upcoming',
                        }),
                      )
                    }
                    className={getInputClass(
                      theme,
                    )}
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
                theme={theme}
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
            theme={theme}
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
                    theme={theme}
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
                  theme={theme}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="activity-type"
                      className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                    >
                      Activity Type
                    </label>

                    <select
                      id="activity-type"
                      value={
                        activityForm.type
                      }
                      onChange={(
                        event,
                      ) =>
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
                      className={getInputClass(
                        theme,
                      )}
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
                      className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                    >
                      Date
                    </label>

                    <input
                      id="activity-date"
                      type="date"
                      value={
                        activityForm.date
                      }
                      onChange={(
                        event,
                      ) =>
                        setActivityForm(
                          (current) => ({
                            ...current,
                            date: event
                              .target
                              .value,
                          }),
                        )
                      }
                      className={getInputClass(
                        theme,
                      )}
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
                  theme={theme}
                />

                <div>
                  <label
                    htmlFor="activity-description"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
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
                    className={`${getInputClass(
                      theme,
                    )} resize-none`}
                  />
                </div>

                <ImageUploadField
                  id="activity-image"
                  label="Activity Image"
                  preview={
                    activityImagePreview
                  }
                  onChange={(event) =>
                    handleIdolImageChange(
                      event,
                      setActivityImageFile,
                      setActivityImagePreview,
                      setError,
                    )
                  }
                  theme={theme}
                />

                <div>
                  <label
                    htmlFor="activity-status"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
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
                            event.target
                              .value as
                            | 'Upcoming'
                            | 'Completed'
                            | 'Cancelled',
                        }),
                      )
                    }
                    className={getInputClass(
                      theme,
                    )}
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
                theme={theme}
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

function getInputClass(
  theme: AdminTheme,
) {
  const c = getThemeTokens(theme)

  return `w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10`
}

function DataSection({
  title,
  description,
  actionLabel,
  onAction,
  children,
  theme,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  children: React.ReactNode
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <div
      className={`overflow-hidden rounded-xl border ${c.border} ${c.surface}`}
    >
      <div
        className={`flex flex-col gap-4 border-b ${c.border} px-6 py-5 md:flex-row md:items-center md:justify-between`}
      >
        <div>
          <h3
            className={`text-xl font-bold ${c.textPrimary}`}
          >
            {title}
          </h3>

          <p
            className={`mt-1 text-sm ${c.textMuted}`}
          >
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      </div>

      {children}
    </div>
  )
}

function ImageUploadField({
  id,
  label,
  preview,
  onChange,
  rounded = false,
  theme,
}: {
  id: string
  label: string
  preview: string
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void
  rounded?: boolean
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
      >
        {label}
      </label>

      <label
        htmlFor={id}
        className={`group block cursor-pointer overflow-hidden rounded-xl border border-dashed ${c.border} ${c.input} transition hover:border-violet-500`}
      >
        {preview ? (
          <div
            className={`relative h-44 overflow-hidden ${rounded
                ? 'flex items-center justify-center'
                : ''
              }`}
          >
            <img
              src={preview}
              alt={label}
              className={`h-full w-full object-cover ${rounded
                  ? 'h-36 w-36 rounded-full'
                  : ''
                }`}
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-neutral-900">
                <Upload className="h-4 w-4" />
                Change image
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-44 flex-col items-center justify-center px-6 text-center">
            <ImagePlus className="h-8 w-8 text-violet-500" />

            <p
              className={`mt-3 text-sm font-medium ${c.textPrimary}`}
            >
              Upload image
            </p>

            <p
              className={`mt-1 text-xs ${c.textMuted}`}
            >
              JPG, PNG, WEBP, or GIF.
              Maximum 5 MB.
            </p>

            <p
              className={`mt-1 text-xs ${c.textMuted}`}
            >
              Stored automatically up to
              150 KB.
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
  theme,
}: {
  id: string
  label: string
  value: string
  placeholder?: string
  type?: string
  onChange: (value: string) => void
  theme: AdminTheme
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-2 block text-sm font-medium ${getThemeTokens(theme).textPrimary
          }`}
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
        className={getInputClass(
          theme,
        )}
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
  theme,
}: {
  title: string
  description: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border ${c.border} ${c.surface} shadow-2xl ${wide
            ? 'max-w-2xl'
            : 'max-w-lg'
          }`}
      >
        <div
          className={`flex items-center justify-between border-b ${c.border} px-6 py-5`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${c.textPrimary}`}
            >
              {title}
            </h2>

            <p
              className={`mt-1 text-sm ${c.textMuted}`}
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 ${c.textMuted} ${c.hover} transition`}
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
  theme,
}: {
  onCancel: () => void
  submitLabel: string
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <div
      className={`flex justify-end gap-3 border-t ${c.border} px-6 py-5`}
    >
      <button
        type="button"
        onClick={onCancel}
        className={`rounded-lg border ${c.border} px-5 py-2.5 text-sm font-medium ${c.textSecondary} ${c.hover} transition`}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={
          submitLabel === 'Saving...'
        }
      >
        {submitLabel}
      </button>
    </div>
  )
}

function ErrorMessage({
  message,
  theme,
}: {
  message: string
  theme: AdminTheme
}) {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
      {message}
    </div>
  )
}

function EmptyTableRow({
  colSpan,
  message,
  theme,
}: {
  colSpan: number
  message: string
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <tr>
      <td
        colSpan={colSpan}
        className={`px-6 py-16 text-center text-sm ${c.textMuted}`}
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
  theme,
}: {
  icon: React.ReactNode
  label: string
  value: string
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <div
      className={`rounded-xl border ${c.border} ${c.surface} p-5 transition hover:-translate-y-0.5`}
    >
      <div className="mb-3 rounded-lg bg-violet-500/10 p-2 w-fit text-violet-500">
        {icon}
      </div>

      <p
        className={`text-sm ${c.textMuted}`}
      >
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-bold ${c.textPrimary}`}
      >
        {value}
      </p>
    </div>
  )
}

function DetailCard({
  label,
  value,
  theme,
}: {
  label: string
  value: string
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <div
      className={`rounded-xl border ${c.border} ${c.surface} p-5`}
    >
      <p
        className={`text-sm ${c.textMuted}`}
      >
        {label}
      </p>

      <p
        className={`mt-1 text-xl font-bold ${c.textPrimary}`}
      >
        {value}
      </p>
    </div>
  )
}

function IconButton({
  title,
  onClick,
  children,
  theme,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border ${c.border} p-2 ${c.textMuted} ${c.hover} transition hover:text-violet-500`}
      title={title}
    >
      {children}
    </button>
  )
}

function DeleteButton({
  title,
  onClick,
}: {
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-red-500/20 p-2 text-red-500 transition hover:bg-red-500/10"
      title={title}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}

function StatusBadge({
  status,
  theme,
}: {
  status: 'Active' | 'Inactive'
  theme: AdminTheme
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status === 'Active'
          ? theme === 'light'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-emerald-500/10 text-emerald-400'
          : theme === 'light'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-amber-500/10 text-amber-400'
        }`}
    >
      {status}
    </span>
  )
}

function ReleaseStatusBadge({
  status,
  theme,
}: {
  status: 'Released' | 'Upcoming'
  theme: AdminTheme
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status === 'Released'
          ? theme === 'light'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-emerald-500/10 text-emerald-400'
          : theme === 'light'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-blue-500/10 text-blue-400'
        }`}
    >
      {status}
    </span>
  )
}

function MusicVideoStatusBadge({
  status,
  theme,
}: {
  status: 'Published' | 'Upcoming'
  theme: AdminTheme
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status === 'Published'
          ? theme === 'light'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-emerald-500/10 text-emerald-400'
          : theme === 'light'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-blue-500/10 text-blue-400'
        }`}
    >
      {status}
    </span>
  )
}

function ActivityStatusBadge({
  status,
  theme,
}: {
  status:
  | 'Upcoming'
  | 'Completed'
  | 'Cancelled'
  theme: AdminTheme
}) {
  const className =
    status === 'Upcoming'
      ? theme === 'light'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-blue-500/10 text-blue-400'
      : status === 'Completed'
        ? theme === 'light'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-emerald-500/10 text-emerald-400'
        : theme === 'light'
          ? 'bg-red-50 text-red-700'
          : 'bg-red-500/10 text-red-400'

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {status}
    </span>
  )
}
