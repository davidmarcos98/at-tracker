'use client';

import { SVGProps, useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
  Link,
  Image,
  Code,
  Input
} from '@heroui/react';

import { JSX } from 'react/jsx-runtime';

export const AnchorIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="-10px" width="28" height="28" viewBox="0 15 75 75">
        <path fill="currentColor" d="M 43 12 C 40.791 12 39 13.791 39 16 C 39 18.209 40.791 20 43 20 L 46.34375 20 L 35.171875 31.171875 C 33.609875 32.733875 33.609875 35.266125 35.171875 36.828125 C 35.951875 37.608125 36.977 38 38 38 C 39.023 38 40.048125 37.608125 40.828125 36.828125 L 52 25.65625 L 52 29 C 52 31.209 53.791 33 56 33 C 58.209 33 60 31.209 60 29 L 60 16 C 60 13.791 58.209 12 56 12 L 43 12 z M 23 14 C 18.037 14 14 18.038 14 23 L 14 49 C 14 53.962 18.037 58 23 58 L 49 58 C 53.963 58 58 53.962 58 49 L 58 41 C 58 38.791 56.209 37 54 37 C 51.791 37 50 38.791 50 41 L 50 49 C 50 49.551 49.552 50 49 50 L 23 50 C 22.448 50 22 49.551 22 49 L 22 23 C 22 22.449 22.448 22 23 22 L 31 22 C 33.209 22 35 20.209 35 18 C 35 15.791 33.209 14 31 14 L 23 14 z"></path>
    </svg>
  );
};
const { tmText } = require('tm-text');

interface PlayerMap {
  mapUid: string;
  mapId: string;
  name: string;
  author: string;
  authorPlayer?: {
    displayName: string;
  };
  medalAuthor: number;
  medalGold: number;
  medalSilver: number;
  medalBronze: number;
  currentMedal?: string;
  year: number;
  month: number;
  day: number;
  isTotd: boolean;
  totdDate?: string;
  atCount: number;
  thumbnailUrl?: string;
  entryId?: number;
  time?: number;
  rank?: number;
  date?: string;
  isAt?: boolean;
}

interface SortDescriptor {
  column: string;
  direction: 'ascending' | 'descending';
}

interface Column {
    key: string;
    text: string;
    maxWidth: any;
    align: 'center'|'start'|'end'|undefined;
}

export default function MapsTable({maps, playerMaps=true, pageSize=15}: {maps: PlayerMap[], playerMaps?: boolean, pageSize?: number}) {
  const [filteredMaps, setFilteredMaps] = useState<PlayerMap[]>([]);
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [search, setSearch] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'date',
    direction: 'descending',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [medalFilterOptions, setMedalFilterOptions] = useState<string[]>(["at", "gold", "silver", "bronze", "none"]);
  const [selectedMedalOptions, setSelectedMedalOptions] = useState(new Set(["at", "gold", "silver", "bronze", "none"]));
  const medalsMapping: { [key: string]: { alt: string; src: string }} = {
    at: {
      alt: "Author Medal",
      src: "/medal_author.png",
    },
    gold: {
      alt: "Gold Medal",
      src: "/medal_gold.png",
    },
    silver: {
      alt: "Silver Medal",
      src: "/medal_silver.png",
    },
    bronze: {
      alt: "Bronze Medal",
      src: "/medal_bronze.png",
    },
    none: {
      alt: "No Medal",
      src: "/medal_none.png",
    }
  }

  useEffect(() => {
    let filtered = maps;

    if (filter === 'complete') {
      filtered = maps.filter((map) => map.isAt);
    } else if (filter === 'incomplete') {
      filtered = maps.filter((map) => !map.isAt);
    }

    filtered = filtered.filter((map) => tmText(map.name).humanize().toLowerCase().includes(search.toLowerCase()) || map.authorPlayer?.displayName.toLowerCase().includes(search.toLowerCase()) || map.author?.toLowerCase().includes(search.toLowerCase()))


    const currentMedalOptions = new Set()
    filtered.forEach((map) => {
        if (map.time) {
            if (map.time < map.medalAuthor) {
                map.currentMedal = "at"
                currentMedalOptions.add("at")
            } else if (map.time < map.medalGold) {
                map.currentMedal = "gold"
                currentMedalOptions.add("gold")
            } else if (map.time < map.medalSilver) {
                map.currentMedal = "silver"
                currentMedalOptions.add("silver")
            } else if (map.time < map.medalBronze) {
                map.currentMedal = "bronze"
                currentMedalOptions.add("bronze")
            } 
        } else {
          map.currentMedal = "none"
          currentMedalOptions.add("none")
        }
    })
    setMedalFilterOptions([...currentMedalOptions] as string[])

    if (playerMaps) {
      console.log('a', selectedMedalOptions, filtered[0])
      filtered = filtered.filter((map) => selectedMedalOptions.has(map.currentMedal ?? "none"))
    }
    // Sort the filtered maps
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortDescriptor.column) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'date':
          aValue = new Date(a.year, a.month - 1, a.day).getTime();
          bValue = new Date(b.year, b.month - 1, b.day).getTime();
          break;
        case 'authorTime':
          aValue = a.medalAuthor;
          bValue = b.medalAuthor;
          break;
        case 'time':
          aValue = a.time ?? Infinity;
          bValue = b.time ?? Infinity;
          break;
        case 'atcount':
          aValue = a.atCount;
          bValue = b.atCount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDescriptor.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDescriptor.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredMaps(sorted);
  }, [search, filter, maps, sortDescriptor, selectedMedalOptions]);

  const completedMaps = maps.filter((m) => m.isAt).length;
  const missingMaps = maps.length - completedMaps;

  // Pagination logic
  const totalPages = Math.ceil(filteredMaps.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMaps = filteredMaps.slice(startIndex, endIndex);

  function parseTime(time: number) {
    const seconds = Math.floor(time / 1000);
    const millis = time % 1000;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }

  function parseTimeDifference(time: number) {
    const seconds = Math.floor(time / 1000);
    const millis = time % 1000;
    const secs = seconds % 60;

    return `${String(secs).padStart(1, '0')}.${String(millis).padStart(3, '0')}`;
  }

  const SearchIcon = (props: any) => {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
      >
        <path
          d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M22 22L20 20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  };

  const topContent = useMemo(() => {
    return (
        <>
            <div className="flex flex-row justify-between">
                <div className="flex justify-between gap-3 items-end min-w-32">
                <Input
                    isClearable
                    className={playerMaps ? "w-[85%] md:w-full" : "w-full"}
                    placeholder="Search by name/author"
                    startContent={<SearchIcon />}
                    value={search}
                    onClear={() => setSearch('')}
                    onValueChange={(value) => setSearch(value)}
                />
                </div>
                { playerMaps && (
                    <div className="flex justify-between gap-3 items-end">
                    <Button
                        size="md"
                        variant={filter === 'all' ? 'solid' : 'ghost'}
                        onPress={() => setFilter('all')}
                    >
                        All ({maps.length})
                    </Button>
                    <Button
                        className='hidden md:inline-flex'
                        size="md"
                        variant={filter === 'complete' ? 'solid' : 'ghost'}
                        onPress={() => setFilter('complete')}
                    >
                        Complete ({completedMaps})
                    </Button>
                    <Button
                        size="md"
                        variant={filter === 'incomplete' ? 'solid' : 'ghost'}
                        onPress={() => setFilter('incomplete')}
                    >
                        Incomplete ({missingMaps})
                    </Button>
                    </div>
                )}
            </div>
            {playerMaps && (
              <div className='flex gap-2 justify-end'>
                {medalFilterOptions.map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={selectedMedalOptions.has(option) ? 'solid' : 'bordered'}
                    onPress={() => setSelectedMedalOptions(selectedMedalOptions.has(option) ? new Set([...selectedMedalOptions].filter((o) => o !== option)): new Set([...selectedMedalOptions, option]))}
                    >
                    <Image width={24} src={medalsMapping[option].src}></Image>
                  </Button>
                ))}
              </div>
            )}
        </>
    );
  }, [
    search,
    filter,
    selectedMedalOptions,
    medalFilterOptions
  ]);

  const columns: Column[] = [
    {
        key: 'name',
        text: 'Map Name',
        maxWidth: null,
        align: undefined
    },
    {
        key: 'author',
        text: 'Author',
        maxWidth: null,
        align: 'center',
    },
    {
        key: 'atcount',
        text: 'AT #',
        maxWidth: 3,
        align: 'center',
    },
    {
        key: 'date',
        text: 'Date',
        maxWidth: 5,
        align: 'center',
    },
    {
        key: 'authorTime',
        text: 'AT',
        maxWidth: 5,
        align: 'center',
    }
  ]
  if (playerMaps) {
    columns.push({
        key: 'time',
        text: 'Time',
        maxWidth: null,
        align: 'center',
    })
} 

  function getCell(item: PlayerMap, key: string | number){
    switch(key){
        case 'name':
            return (
                <Link isBlock color='foreground' isExternal showAnchorIcon href={`https://trackmania.io/#/leaderboard/${item.mapUid}`}>
                    <div
                        className='text-lg'
                        dangerouslySetInnerHTML={{
                        __html: tmText(item.name).htmlify(),
                        }}
                    />
                </Link>
            )
        case 'atcount':
            return item.atCount
        case 'date':
            return (
                <Code size="sm">
                    {String(item.day).padStart(2, '0')}/{String(item.month).padStart(2, '0')}/{item.year.toString().slice(-2)}
                </Code>
            )
        case 'authorTime':
            return parseTime(item.medalAuthor)
        case 'time':
            return (
                <div className='inline-flex items-center gap-2 text-md'>
                    <Image src={item.isAt ? "/medal_author.png" : (item.time == null || item.time == undefined ? "/medal_none.png" : "/medal_gold.png")} width={28}></Image>
                    {item.time === null || item.time === undefined
                    ? 'Not played'
                    : `${parseTime(item.time)} (${
                        item.time - item.medalAuthor > 0 ? '+' : '-'
                        }${parseTimeDifference(Math.abs(item.time - item.medalAuthor))})`}
                </div>
            )
        case 'author':
            return item.authorPlayer?.displayName
    }
  }

  return (
    <Table
        className='mapsTable'
        aria-label="Player maps table"
        sortDescriptor={sortDescriptor}
        onSortChange={(descriptor: any) => {
            setSortDescriptor({
                column: descriptor.column,
                direction: descriptor.direction,
            });
            setCurrentPage(1); // Reset to first page when sorting
        }}
        topContent={topContent}
        bottomContent={
            <div className="flex w-full justify-center">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={currentPage}
                    total={totalPages}
                    onChange={(page) => setCurrentPage(page)}
                />
            </div>
        }
    >
        <TableHeader columns={columns}>
            {(column) => (
                <TableColumn key={column.key} maxWidth={column.maxWidth} align={column.align} allowsSorting={['atcount', 'name', 'date'].includes(column.key) ? true : false} className='text-sm font-bold'>
                    {column.text}
                </TableColumn>
            )}
        </TableHeader>
        <TableBody items={paginatedMaps} emptyContent="No maps found">
            {(item) => (
                <TableRow key={item.mapUid} className='text-md'>
                    {(columnKey) => <TableCell>{getCell(item, columnKey)}</TableCell>}
                </TableRow>
            )}
        </TableBody>
    </Table>
  );
}
